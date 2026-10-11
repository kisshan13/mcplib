import type { RequestHandler } from "express";
import { OrganizationRole } from "@packages/prisma";
import {
  dtoMcpConfiguration,
  dtoMcpMetadata,
  dtoMcpMetadataList,
  dtoMcpToolsList
} from "../../dto/mcp-registry.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { McpRegistryError, getRegisteredMcp, mcpRegistry } from "../../registry/mcp-registry.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  validatorMcpConfigurationBody,
  validatorMcpConfigurationQuery,
  validatorMcpRegistryParams,
  type McpConfigurationContext
} from "./validator.js";
import {
  findMcpConfiguration,
  getMcpConfigurationMetadata,
  toMcpConfigurationJson,
  upsertMcpConfiguration
} from "./factory.js";
import {
  sanitizeStoredConfigurationValues,
  validateAndSanitizeConfigurationValues
} from "./configuration-validation.js";
import { findOrganizationMembership } from "../organizations/factory.js";

function getAuthenticatedUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  return req.user.id;
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
  req: Parameters<RequestHandler>[0],
  context: McpConfigurationContext,
  canManage: boolean
): Promise<void> {
  const userId = getAuthenticatedUserId(req);

  if (context.type === "platform") return;

  const membership = await findOrganizationMembership(context.id, userId);
  if (!membership) {
    throw new ApiError("Organization not found", 404);
  }

  if (
    canManage &&
    membership.role !== OrganizationRole.OWNER &&
    membership.role !== OrganizationRole.ADMINISTRATOR
  ) {
    throw new ApiError("You do not have permission to manage this organization", 403);
  }
}

function asJsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toMcpConfigurationResponse(
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

export const controllerListMcpRegistry: RequestHandler = requestHandler(async () => {
  const data = dtoMcpMetadataList.parse(mcpRegistry.list());
  return new ApiResponse(data, "MCP implementations retrieved");
});

export const controllerGetMcpRegistryEntry: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);

  try {
    const data = dtoMcpMetadata.parse(mcpRegistry.get(id).metadata);
    return new ApiResponse(data, "MCP implementation retrieved");
  } catch (error) {
    if (error instanceof McpRegistryError && error.code === "UNKNOWN") {
      throw new ApiError(error.message, 404);
    }
    throw error;
  }
});

export const controllerListMcpTools: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);

  try {
    const data = dtoMcpToolsList.parse(mcpRegistry.listTools(id));
    return new ApiResponse(data, "MCP tools retrieved");
  } catch (error) {
    if (error instanceof McpRegistryError && error.code === "UNKNOWN") {
      throw new ApiError(error.message, 404);
    }
    throw error;
  }
});

export const controllerGetMcpConfiguration: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  const query = validatorMcpConfigurationQuery.parse(req.query);
  const context = getConfigurationContextFromQuery(query);

  await assertConfigurationAccess(req, context, false);

  const entry = getRegisteredMcp(id);
  const configuration = getMcpConfigurationMetadata(entry.metadata);

  if (!configuration) {
    return new ApiResponse(null, "This MCP does not require stored configuration");
  }

  const record = await findMcpConfiguration(id, context);
  const data = record
    ? dtoMcpConfiguration.parse(toMcpConfigurationResponse(record, configuration))
    : null;

  return new ApiResponse(
    data,
    data ? "MCP configuration retrieved" : "MCP configuration not found"
  );
});

export const controllerUpsertMcpConfiguration: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  const body = validatorMcpConfigurationBody.parse(req.body);

  await assertConfigurationAccess(req, body.context, true);

  const entry = getRegisteredMcp(id);
  const configuration = getMcpConfigurationMetadata(entry.metadata);

  if (!configuration) {
    throw new ApiError("This MCP does not require stored configuration", 409);
  }

  const values = validateAndSanitizeConfigurationValues(configuration, body.values);
  const record = await upsertMcpConfiguration({
    mcpId: id,
    context: body.context,
    values: toMcpConfigurationJson(values)
  });

  return new ApiResponse(
    dtoMcpConfiguration.parse(toMcpConfigurationResponse(record, configuration)),
    "MCP configuration saved"
  );
});
