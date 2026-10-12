import type { RequestHandler } from "express";
import { OAuthOwnershipType, OrganizationRole } from "@packages/prisma";
import {
  dtoApiKey,
  dtoApiKeyAccess,
  dtoApiKeyAccessList,
  dtoApiKeyCreated,
  dtoApiKeyList
} from "../../dto/api-key.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import { mcpRegistry } from "../../registry/mcp-registry.js";
import { findOrganizationMembership } from "../organizations/service.js";
import {
  createApiKey,
  findManageableApiKey,
  grantApiKeyMcpAccess,
  listApiKeyMcpAccess,
  listApiKeys,
  revokeApiKey,
  revokeApiKeyMcpAccess
} from "./service.js";
import {
  validatorApiKeyIdParams,
  validatorApiKeyMcpParams,
  validatorCreateApiKeyBody,
  validatorGrantMcpAccessBody,
  validatorListApiKeysQuery
} from "./validator.js";

function getUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) throw new ApiError("Unauthorized", 401);
  return req.user.id;
}

function toSafeApiKey(record: {
  id: string;
  name: string;
  description: string | null;
  ownershipType: OAuthOwnershipType;
  organizationId: string | null;
  prefix: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  organization?: { id: string; name: string } | null;
  mcpAccess?: Array<{ mcpId: string; createdAt: Date }>;
  _count?: { mcpAccess: number };
}) {
  return dtoApiKey.parse({
    id: record.id,
    name: record.name,
    description: record.description,
    type: record.ownershipType === OAuthOwnershipType.PLATFORM ? "platform" : "organization",
    organization: record.organization
      ? { id: record.organization.id, name: record.organization.name }
      : null,
    prefix: record.prefix,
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt?.toISOString() ?? null,
    revokedAt: record.revokedAt?.toISOString() ?? null,
    lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
    mcpAccessCount: record._count?.mcpAccess ?? record.mcpAccess?.length ?? 0,
    mcpAccess: record.mcpAccess?.map((access) => toAccess(access)) ?? []
  });
}

function getMcpMetadata(mcpId: string) {
  try {
    const metadata = mcpRegistry.get(mcpId).metadata;
    return { displayName: metadata.displayName, description: metadata.description ?? null };
  } catch {
    return { displayName: mcpId, description: null };
  }
}

function toAccess(access: { mcpId: string; createdAt: Date }) {
  return dtoApiKeyAccess.parse({
    mcpId: access.mcpId,
    createdAt: access.createdAt.toISOString(),
    ...getMcpMetadata(access.mcpId)
  });
}

async function getManagedKey(keyId: string, userId: string) {
  const key = await findManageableApiKey(keyId, userId);
  if (!key) throw new ApiError("API key not found", 404);
  return key;
}

async function assertOrganizationManager(organizationId: string, userId: string) {
  const membership = await findOrganizationMembership(organizationId, userId);
  if (!membership) throw new ApiError("Organization not found", 404);
  if (
    membership.role !== OrganizationRole.OWNER &&
    membership.role !== OrganizationRole.ADMINISTRATOR
  ) {
    throw new ApiError("You do not have permission to manage API keys for this organization", 403);
  }
}

function getExpiration(body: ReturnType<typeof validatorCreateApiKeyBody.parse>): Date | null {
  if (body.expiresAt) return new Date(body.expiresAt);
  if (body.expirationDays !== undefined)
    return new Date(Date.now() + body.expirationDays * 86400000);
  return null;
}

export const controllerCreateApiKey: RequestHandler = requestHandler(async (req) => {
  const userId = getUserId(req);
  const body = validatorCreateApiKeyBody.parse(req.body);
  const organizationId = body.organizationId ?? null;
  if (organizationId) await assertOrganizationManager(organizationId, userId);
  const expiresAt = getExpiration(body);
  if (expiresAt && expiresAt.getTime() <= Date.now())
    throw new ApiError("Expiration must be in the future", 400);
  const result = await createApiKey({
    name: body.name,
    description: body.description ?? null,
    ownershipType:
      body.type === "platform" ? OAuthOwnershipType.PLATFORM : OAuthOwnershipType.ORGANIZATION,
    organizationId,
    userId,
    expiresAt
  });
  return new ApiResponse(
    dtoApiKeyCreated.parse({ key: toSafeApiKey(result.record), secret: result.secret }),
    "API key created. Copy the secret now; it cannot be retrieved later.",
    201
  );
});

export const controllerListApiKeys: RequestHandler = requestHandler(async (req) => {
  const query = validatorListApiKeysQuery.parse(req.query);
  const result = await listApiKeys({ userId: getUserId(req), ...query });
  return new ApiResponse(
    dtoApiKeyList.parse({
      items: result.items.map(toSafeApiKey),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize)
    }),
    "API keys retrieved"
  );
});

export const controllerGetApiKey: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  return new ApiResponse(
    toSafeApiKey(await getManagedKey(keyId, getUserId(req))),
    "API key retrieved"
  );
});

export const controllerRevokeApiKey: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  const key = await getManagedKey(keyId, getUserId(req));
  return new ApiResponse(
    toSafeApiKey(key.revokedAt ? key : await revokeApiKey(key.id)),
    "API key revoked"
  );
});

export const controllerListApiKeyMcpAccess: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  await getManagedKey(keyId, getUserId(req));
  const access = await listApiKeyMcpAccess(keyId);
  return new ApiResponse(
    dtoApiKeyAccessList.parse(access.map(toAccess)),
    "API key MCP access retrieved"
  );
});

export const controllerGrantApiKeyMcpAccess: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  const body = validatorGrantMcpAccessBody.parse(req.body);
  await getManagedKey(keyId, getUserId(req));
  try {
    mcpRegistry.get(body.mcpId);
  } catch {
    throw new ApiError("MCP server not found", 404);
  }
  const access = await grantApiKeyMcpAccess(keyId, body.mcpId);
  return new ApiResponse(toAccess(access), "MCP access granted", 201);
});

export const controllerRevokeApiKeyMcpAccess: RequestHandler = requestHandler(async (req) => {
  const { keyId, mcpId } = validatorApiKeyMcpParams.parse(req.params);
  await getManagedKey(keyId, getUserId(req));
  await revokeApiKeyMcpAccess(keyId, mcpId);
  return new ApiResponse(null, "MCP access revoked");
});
