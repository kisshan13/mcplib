import { Router } from "express";
import { env } from "../../config/env.js";
import {
  McpConfigurationScope,
  OAuthOwnershipType,
  Prisma,
  TokenOwnerType,
  TokenStatus
} from "@packages/prisma";
import type { McpMetadata } from "@packages/mcp-core";
import prisma from "../../lib/prisma.js";
import {
  controllerGetMcpConfiguration,
  controllerGetMcpRegistryEntry,
  controllerListMcpTools,
  controllerListMcpRegistry,
  controllerListMcpConfigurationStatuses,
  controllerUpsertMcpConfiguration
} from "./controller.js";
import type { McpConfigurationContext } from "./validator.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { resolveMcpConfiguration } from "../../lib/registry.js";
import { mcpRegistry } from "../../registry/mcp-registry.js";

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

export function getMcpConfigurationScopeKey(context: McpConfigurationContext): string {
  return context.type === "platform" ? "platform" : `organization:${context.id}`;
}

export function findMcpConfiguration(mcpId: string, context: McpConfigurationContext) {
  return prisma.mcpConfiguration.findUnique({
    where: {
      mcpId_scopeKey: {
        mcpId,
        scopeKey: getMcpConfigurationScopeKey(context)
      }
    }
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

export function factoryMcpRegistryRouter(): Router {
  const router = Router();

  router.get("/", controllerListMcpRegistry);
  router.get("/configuration/status", authMiddleware(), controllerListMcpConfigurationStatuses);
  router.get("/:id/configuration", authMiddleware(), controllerGetMcpConfiguration);
  router.put("/:id/configuration", authMiddleware(), controllerUpsertMcpConfiguration);
  router.get("/:id/tools", controllerListMcpTools);
  router.get("/:id", controllerGetMcpRegistryEntry);

  return router;
}
