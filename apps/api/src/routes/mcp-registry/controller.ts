import type { RequestHandler } from "express";
import {
  dtoMcpConfiguration,
  dtoMcpConfigurationStatusList,
  dtoMcpDirectCredential,
  dtoMcpMetadata,
  dtoMcpMetadataList,
  dtoMcpToolsList
} from "../../dto/mcp-registry.dto.js";
import ApiResponse from "../../lib/response.js";
import { getAuthenticatedUserId } from "../../middlewares/auth.middleware.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  getMcpConfigurationForUser,
  getMcpMetadata,
  listMcpMetadata,
  listMcpTools,
  listPlatformMcpConfigurationStatuses,
  saveMcpConfigurationForUser,
  saveMcpDirectCredentialForUser,
  toMcpConfigurationResponse
} from "./factory.js";
import {
  validatorMcpConfigurationBody,
  validatorMcpConfigurationQuery,
  validatorMcpDirectCredentialBody,
  validatorMcpRegistryParams
} from "./validator.js";

export const controllerListMcpRegistry: RequestHandler = requestHandler(async () => {
  return new ApiResponse(
    dtoMcpMetadataList.parse(listMcpMetadata()),
    "MCP implementations retrieved"
  );
});

export const controllerListMcpConfigurationStatuses: RequestHandler = requestHandler(
  async (req) => {
    const data = await listPlatformMcpConfigurationStatuses(getAuthenticatedUserId(req));
    return new ApiResponse(
      dtoMcpConfigurationStatusList.parse(data),
      "MCP configuration statuses retrieved"
    );
  }
);

export const controllerGetMcpRegistryEntry: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  return new ApiResponse(dtoMcpMetadata.parse(getMcpMetadata(id)), "MCP implementation retrieved");
});

export const controllerListMcpTools: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  return new ApiResponse(dtoMcpToolsList.parse(listMcpTools(id)), "MCP tools retrieved");
});

export const controllerGetMcpConfiguration: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  const query = validatorMcpConfigurationQuery.parse(req.query);
  const result = await getMcpConfigurationForUser(id, query, getAuthenticatedUserId(req));
  if (!result.configuration) {
    return new ApiResponse(null, "This MCP does not require stored configuration");
  }
  const data = result.record
    ? dtoMcpConfiguration.parse(toMcpConfigurationResponse(result.record, result.configuration))
    : null;
  return new ApiResponse(
    data,
    data ? "MCP configuration retrieved" : "MCP configuration not found"
  );
});

export const controllerUpsertMcpConfiguration: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  const body = validatorMcpConfigurationBody.parse(req.body);
  const result = await saveMcpConfigurationForUser(id, body, getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoMcpConfiguration.parse(toMcpConfigurationResponse(result.record, result.configuration)),
    "MCP configuration saved"
  );
});

export const controllerUpsertMcpDirectCredential: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorMcpRegistryParams.parse(req.params);
  const body = validatorMcpDirectCredentialBody.parse(req.body);
  const record = await saveMcpDirectCredentialForUser(id, body, getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoMcpDirectCredential.parse({
      mcpId: id,
      configured: true,
      scope: body.context.type,
      organizationId: body.context.type === "organization" ? body.context.id : null,
      updatedAt: record.updatedAt.toISOString()
    }),
    "MCP credential configured"
  );
});
