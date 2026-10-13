import { OAuthOwnershipType, OrganizationRole } from "@packages/prisma";
import { ApiError } from "../../lib/error.js";
import { mcpRegistry } from "../../registry/mcp-registry.js";
import { findOrganizationMembership } from "../organizations/service.js";
import { findOrganizationProfile } from "../organizations/profiles/service.js";
import {
  createApiKey,
  findManageableApiKey,
  grantApiKeyMcpAccess,
  listApiKeyMcpAccess,
  listApiKeys,
  revokeApiKey,
  revokeApiKeyMcpAccess
} from "./service.js";
import type {
  validatorCreateApiKeyBody,
  validatorGrantMcpAccessBody,
  validatorListApiKeysQuery
} from "./validator.js";

type CreateApiKeyInput = ReturnType<typeof validatorCreateApiKeyBody.parse>;
type ListApiKeysInput = ReturnType<typeof validatorListApiKeysQuery.parse>;

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

function getExpiration(body: CreateApiKeyInput): Date | null {
  if (body.expiresAt) return new Date(body.expiresAt);
  if (body.expirationDays !== undefined) {
    return new Date(Date.now() + body.expirationDays * 86400000);
  }
  return null;
}

async function getManagedKey(keyId: string, userId: string) {
  const key = await findManageableApiKey(keyId, userId);
  if (!key) throw new ApiError("API key not found", 404);
  return key;
}

export async function createApiKeyForUser(body: CreateApiKeyInput, userId: string) {
  const organizationId = body.organizationId ?? null;
  if (organizationId) await assertOrganizationManager(organizationId, userId);
  if (body.profileId) {
    const profile = await findOrganizationProfile(organizationId!, body.profileId);
    if (!profile) throw new ApiError("Organization profile not found", 404);
  }

  const expiresAt = getExpiration(body);
  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    throw new ApiError("Expiration must be in the future", 400);
  }

  return createApiKey({
    name: body.name,
    description: body.description ?? null,
    ownershipType:
      body.type === "platform" ? OAuthOwnershipType.PLATFORM : OAuthOwnershipType.ORGANIZATION,
    organizationId,
    userId: body.profileId ? null : userId,
    profileId: body.profileId ?? null,
    expiresAt
  });
}

export function listApiKeysForUser(query: ListApiKeysInput, userId: string) {
  return listApiKeys({ userId, ...query });
}

export function getApiKeyForUser(keyId: string, userId: string) {
  return getManagedKey(keyId, userId);
}

export async function revokeApiKeyForUser(keyId: string, userId: string) {
  const key = await getManagedKey(keyId, userId);
  return key.revokedAt ? key : revokeApiKey(key.id);
}

export async function listApiKeyAccessForUser(keyId: string, userId: string) {
  await getManagedKey(keyId, userId);
  return listApiKeyMcpAccess(keyId);
}

export async function grantApiKeyAccessForUser(
  keyId: string,
  body: ReturnType<typeof validatorGrantMcpAccessBody.parse>,
  userId: string
) {
  await getManagedKey(keyId, userId);
  try {
    mcpRegistry.get(body.mcpId);
  } catch {
    throw new ApiError("MCP server not found", 404);
  }
  return grantApiKeyMcpAccess(keyId, body.mcpId);
}

export async function revokeApiKeyAccessForUser(keyId: string, mcpId: string, userId: string) {
  await getManagedKey(keyId, userId);
  await revokeApiKeyMcpAccess(keyId, mcpId);
}
