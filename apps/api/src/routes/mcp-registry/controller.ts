import type { RequestHandler } from "express";
import { dtoMcpMetadata, dtoMcpMetadataList, dtoMcpToolsList } from "../../dto/mcp-registry.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { McpRegistryError, mcpRegistry } from "../../registry/mcp-registry.js";
import { requestHandler } from "../../utils/request-handler.js";
import { validatorMcpRegistryParams } from "./validator.js";

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
