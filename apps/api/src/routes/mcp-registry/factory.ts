import { Router } from "express";
import { McpConfigurationScope, Prisma } from "@packages/prisma";
import type { McpMetadata } from "@packages/mcp-core";
import prisma from "../../lib/prisma.js";
import {
  controllerGetMcpConfiguration,
  controllerGetMcpRegistryEntry,
  controllerListMcpTools,
  controllerListMcpRegistry,
  controllerUpsertMcpConfiguration
} from "./controller.js";
import type { McpConfigurationContext } from "./validator.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

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
      organizationId: isOrganization ? input.context.id : null,
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
  router.get("/:id/configuration", authMiddleware(), controllerGetMcpConfiguration);
  router.put("/:id/configuration", authMiddleware(), controllerUpsertMcpConfiguration);
  router.get("/:id/tools", controllerListMcpTools);
  router.get("/:id", controllerGetMcpRegistryEntry);

  return router;
}
