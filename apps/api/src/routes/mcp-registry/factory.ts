import { env } from "../../config/env.js";
import {
  AuthenticationMethod,
  McpConfigurationScope,
  OAuthOwnershipType,
  Prisma,
  TokenOwnerType,
  TokenStatus
} from "@packages/prisma";
import type { McpMetadata } from "@packages/mcp-core";
import prisma from "../../lib/prisma.js";
import { encryptCredential } from "../../lib/credential-encryption.js";
import { validatorMcpConfigurationQuery, type McpConfigurationContext } from "./validator.js";
import { getRegisteredMcp, McpRegistryError, resolveMcpConfiguration } from "../../lib/registry.js";
import { mcpRegistry } from "../../registry/mcp-registry.js";
import { findOrganizationMembership } from "../organizations/service.js";
import { OrganizationRole } from "@packages/prisma";
import { ApiError } from "../../lib/error.js";
import {
  validateAndSanitizeConfigurationValues,
  validateDirectCredentialValue,
  sanitizeStoredConfigurationValues
} from "./configuration-validation.js";

export async function listPlatformMcpConfigurationStatuses(userId: string) {
  const metadata = mcpRegistry.list();
  const resolvedMcps = await Promise.all(
    metadata.map(async (mcp) => {
      const configuration = mcp.secretProviderConfiguration;
      const platformConfiguration = configuration?.oauth
        ? await resolveMcpConfiguration(mcpRegistry.get(mcp.id), { type: "platform" })
        : null;

      return { mcp, configuration, platformConfiguration };
    })
  );
  const configuredMcps = resolvedMcps.flatMap(({ mcp, configuration }) => {
    return configuration ? [{ mcp, configuration }] : [];
  });

  const tokens = configuredMcps.length
    ? await prisma.serviceToken.findMany({
        where: {
          ownershipType: OAuthOwnershipType.PLATFORM,
          ownerType: TokenOwnerType.PLATFORM_USER,
          userId,
          organizationId: null,
          status: TokenStatus.ACTIVE,
          AND: [
            {
              OR: [{ accessTokenExpiresAt: null }, { accessTokenExpiresAt: { gt: new Date() } }]
            },
            {
              OR: configuredMcps.map(({ mcp }) => ({ integrationId: mcp.id }))
            }
          ]
        },
        select: { integrationId: true }
      })
    : [];

  const tokenKeys = new Set(tokens.map((token) => token.integrationId));

  return resolvedMcps.map(({ mcp, configuration, platformConfiguration }) => {
    const platformConfigurationReady = configuration?.oauth
      ? Boolean(platformConfiguration) && Boolean(env.MCPLIB_SECRET_ENCRYPTION_KEY)
      : true;
    const configured = configuration ? tokenKeys.has(mcp.id) : true;

    return {
      mcpId: mcp.id,
      displayName: mcp.displayName,
      configured,
      platformConfigurationReady,
      status: !configuration
        ? "not_required"
        : !platformConfigurationReady
          ? "not_configured"
          : configured
            ? "connected"
            : "needs_authorization",
      authentication: configuration?.oauth ? "oauth" : (configuration?.type ?? null)
    } as const;
  });
}

export async function upsertMcpDirectCredential(input: {
  mcpId: string;
  secretId: string;
  serviceProvider: string;
  userId: string;
  context: McpConfigurationContext;
  value: string;
}) {
  const isOrganization = input.context.type === "organization";
  const where: Prisma.ServiceTokenWhereInput = {
    integrationId: input.mcpId,
    secretId: input.secretId,
    ownershipType: isOrganization ? OAuthOwnershipType.ORGANIZATION : OAuthOwnershipType.PLATFORM,
    ownerType: isOrganization ? TokenOwnerType.ORGANIZATION_USER : TokenOwnerType.PLATFORM_USER,
    userId: input.userId,
    organizationId: input.context.type === "organization" ? input.context.id : null
  };
  const existing = await prisma.serviceToken.findFirst({ where });
  const data = {
    ownershipType: isOrganization ? OAuthOwnershipType.ORGANIZATION : OAuthOwnershipType.PLATFORM,
    ownerType: isOrganization ? TokenOwnerType.ORGANIZATION_USER : TokenOwnerType.PLATFORM_USER,
    organizationId: input.context.type === "organization" ? input.context.id : null,
    userId: input.userId,
    externalUserIdentity: null,
    integrationId: input.mcpId,
    secretId: input.secretId,
    serviceProvider: input.serviceProvider,
    authenticationMethod: AuthenticationMethod.API_KEY,
    oauthApplicationId: null,
    accessTokenEncrypted: encryptCredential(input.value),
    refreshTokenEncrypted: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    grantedScopes: [] as string[],
    status: TokenStatus.ACTIVE
  } as const;

  return existing
    ? prisma.serviceToken.update({ where: { id: existing.id }, data })
    : prisma.serviceToken.create({ data });
}

export function getMcpConfigurationScopeKey(context: McpConfigurationContext): string {
  return context.type === "platform" ? "platform" : `organization:${context.id}`;
}

export function findMcpConfiguration(mcpId: string, context: McpConfigurationContext) {
  return prisma.mcpConfiguration
    .findUnique({
      where: {
        mcpId_scopeKey: {
          mcpId,
          scopeKey: getMcpConfigurationScopeKey(context)
        }
      }
    })
    .then((record) => {
      if (!record) return null;

      const validScope =
        context.type === "platform"
          ? record.scope === McpConfigurationScope.PLATFORM && record.organizationId === null
          : record.scope === McpConfigurationScope.ORGANIZATION &&
            record.organizationId === context.id;

      return validScope ? record : null;
    });
}

export function upsertMcpConfiguration(input: {
  mcpId: string;
  context: McpConfigurationContext;
  values: Prisma.InputJsonValue;
}) {
  const isOrganization = input.context.type === "organization";
  const scopeKey = getMcpConfigurationScopeKey(input.context);

  return prisma.mcpConfiguration.upsert({
    where: {
      mcpId_scopeKey: {
        mcpId: input.mcpId,
        scopeKey
      }
    },
    create: {
      mcpId: input.mcpId,
      scope: isOrganization ? McpConfigurationScope.ORGANIZATION : McpConfigurationScope.PLATFORM,
      scopeKey,
      organizationId: input.context.type === "organization" ? input.context.id : null,
      values: input.values
    },
    update: {
      scope: isOrganization ? McpConfigurationScope.ORGANIZATION : McpConfigurationScope.PLATFORM,
      organizationId: input.context.type === "organization" ? input.context.id : null,
      values: input.values
    }
  });
}

export function toMcpConfigurationJson(values: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(values)) as Prisma.InputJsonValue;
}

export function getMcpConfigurationMetadata(metadata: McpMetadata) {
  const configuration = metadata.secretProviderConfiguration;

  if (!configuration || configuration.type !== "configuration") {
    return null;
  }

  return configuration;
}

export function listMcpMetadata() {
  return mcpRegistry.list();
}

export function getMcpMetadata(id: string) {
  try {
    return mcpRegistry.get(id).metadata;
  } catch (error) {
    if (error instanceof McpRegistryError && error.code === "UNKNOWN") {
      throw new ApiError(error.message, 404);
    }
    throw error;
  }
}

export function listMcpTools(id: string) {
  try {
    return mcpRegistry.listTools(id);
  } catch (error) {
    if (error instanceof McpRegistryError && error.code === "UNKNOWN") {
      throw new ApiError(error.message, 404);
    }
    throw error;
  }
}

function getConfigurationContextFromQuery(
  query: ReturnType<typeof validatorMcpConfigurationQuery.parse>
): McpConfigurationContext {
  if (query.context === "platform") return { type: "platform" };
  if (!query.organizationId) {
    throw new ApiError("organizationId is required for organization context", 400);
  }
  return { type: "organization", id: query.organizationId };
}

async function assertConfigurationAccess(
  context: McpConfigurationContext,
  userId: string,
  canManage: boolean
) {
  if (context.type === "platform") return;
  const membership = await findOrganizationMembership(context.id, userId);
  if (!membership) throw new ApiError("Organization not found", 404);
  if (
    canManage &&
    membership.role !== OrganizationRole.OWNER &&
    membership.role !== OrganizationRole.ADMINISTRATOR
  ) {
    throw new ApiError("You do not have permission to manage this organization", 403);
  }
}

function asJsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function toMcpConfigurationResponse(
  record: {
    id: string;
    mcpId: string;
    scope: "PLATFORM" | "ORGANIZATION";
    organizationId: string | null;
    values: unknown;
    createdAt: Date;
    updatedAt: Date;
  },
  configuration: NonNullable<ReturnType<typeof getMcpConfigurationMetadata>>
) {
  return {
    id: record.id,
    mcpId: record.mcpId,
    scope: record.scope === "PLATFORM" ? "platform" : "organization",
    organizationId: record.organizationId,
    values: sanitizeStoredConfigurationValues(configuration, asJsonObject(record.values)),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function getMcpConfigurationForUser(
  id: string,
  query: ReturnType<typeof validatorMcpConfigurationQuery.parse>,
  userId: string
) {
  const context = getConfigurationContextFromQuery(query);
  await assertConfigurationAccess(context, userId, false);
  const entry = getRegisteredMcp(mcpRegistry, id);
  const configuration = getMcpConfigurationMetadata(entry.metadata);
  if (!configuration) return { configuration: null, record: null };
  return { configuration, record: await findMcpConfiguration(id, context) };
}

export async function saveMcpConfigurationForUser(
  id: string,
  body: { context: McpConfigurationContext; values: Record<string, unknown> },
  userId: string
) {
  await assertConfigurationAccess(body.context, userId, true);
  const entry = getRegisteredMcp(mcpRegistry, id);
  const configuration = getMcpConfigurationMetadata(entry.metadata);
  if (!configuration) throw new ApiError("This MCP does not require stored configuration", 409);
  const values = validateAndSanitizeConfigurationValues(configuration, body.values);
  const record = await upsertMcpConfiguration({
    mcpId: id,
    context: body.context,
    values: toMcpConfigurationJson(values)
  });
  return { configuration, record };
}

export async function saveMcpDirectCredentialForUser(
  id: string,
  body: { context: McpConfigurationContext; values: Record<string, unknown> },
  userId: string
) {
  await assertConfigurationAccess(body.context, userId, true);
  const entry = getRegisteredMcp(mcpRegistry, id);
  const configuration = entry.metadata.secretProviderConfiguration;
  if (!configuration || configuration.type !== "direct") {
    throw new ApiError("This MCP does not accept direct credentials", 409);
  }
  const value = validateDirectCredentialValue(configuration, body.values);
  return upsertMcpDirectCredential({
    mcpId: id,
    secretId: configuration.secretId,
    serviceProvider: entry.metadata.serviceProvider ?? id,
    userId,
    context: body.context,
    value
  });
}
