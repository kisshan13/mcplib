import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import { validatorMcpRegistryParams } from "../routes/mcp-registry/validator.js";

export const dtoMcpMetadata = z
  .object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
    serviceProvider: z.string().optional(),
    supportedAuthMethods: z.array(z.string()),
    requiredScopes: z.array(z.string()),
    capabilities: z.array(z.string()),
    configurationRequirements: z.array(z.string()),
    available: z.boolean()
  })
  .meta({ id: "McpMetadata" });

export const dtoMcpMetadataList = z.array(dtoMcpMetadata).meta({ id: "McpMetadataList" });

export const dtoMcpTool = z
  .object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.record(z.string(), z.unknown()),
    outputSchema: z.record(z.string(), z.unknown())
  })
  .meta({ id: "McpToolMetadata" });

export const dtoMcpToolsList = z.array(dtoMcpTool).meta({ id: "McpToolsList" });

export const dtoMcpMetadataEnvelope = z
  .object({
    data: dtoMcpMetadata,
    message: z.string(),
    success: z.boolean()
  })
  .meta({ id: "McpMetadataEnvelope" });

export const dtoMcpMetadataListEnvelope = z
  .object({
    data: dtoMcpMetadataList,
    message: z.string(),
    success: z.boolean()
  })
  .meta({ id: "McpMetadataListEnvelope" });

export const dtoMcpToolsListEnvelope = z
  .object({
    data: dtoMcpToolsList,
    message: z.string(),
    success: z.boolean()
  })
  .meta({ id: "McpToolsListEnvelope" });

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/mcps",
  responses: {
    200: {
      description: "Available MCP implementations",
      content: {
        "application/json": { schema: dtoMcpMetadataListEnvelope }
      }
    }
  }
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/mcps/{id}",
  request: { params: validatorMcpRegistryParams },
  responses: {
    200: {
      description: "MCP implementation metadata",
      content: {
        "application/json": { schema: dtoMcpMetadataEnvelope }
      }
    }
  }
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/mcps/{id}/tools",
  request: { params: validatorMcpRegistryParams },
  responses: {
    200: {
      description: "Tools available from an MCP implementation",
      content: {
        "application/json": { schema: dtoMcpToolsListEnvelope }
      }
    }
  }
});
