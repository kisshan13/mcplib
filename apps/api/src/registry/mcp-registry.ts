import type { Request, RequestHandler } from "express";
import { z } from "zod";
import type { McpMetadata, McpToolMetadata, McpToolkitRegister } from "@packages/mcp-core";
import type { McpRuntimeContext } from "@packages/mcp-core";
import exampleMcp from "@packages/example-mcp";
import { databaseSecretProvider } from "../lib/secret-provider.js";
import { ApiError } from "../lib/error.js";
import { requestHandler } from "../utils/request-handler.js";

export class McpRegistryError extends Error {
  constructor(
    message: string,
    readonly code: "DUPLICATE" | "UNKNOWN"
  ) {
    super(message);
    this.name = "McpRegistryError";
  }
}

export type McpRegistryEntry = Pick<McpToolkitRegister, "metadata" | "tools" | "register">;

function cloneMetadata(metadata: McpMetadata): McpMetadata {
  return {
    ...metadata,
    supportedAuthMethods: [...metadata.supportedAuthMethods],
    requiredScopes: [...metadata.requiredScopes],
    capabilities: [...metadata.capabilities],
    configurationRequirements: [...metadata.configurationRequirements]
  };
}

function cloneTool(tool: McpToolMetadata): McpToolMetadata {
  return {
    ...tool,
    inputSchema: { ...tool.inputSchema },
    outputSchema: { ...tool.outputSchema }
  };
}

export class McpRegistry {
  private readonly entries = new Map<string, McpRegistryEntry>();

  register(entry: McpRegistryEntry): this {
    const id = entry.metadata.id;
    if (this.entries.has(id)) {
      throw new McpRegistryError(`MCP implementation '${id}' is already registered.`, "DUPLICATE");
    }

    this.entries.set(id, {
      metadata: cloneMetadata(entry.metadata),
      tools: entry.tools.map(cloneTool),
      register: entry.register
    });
    return this;
  }

  get(id: string): McpRegistryEntry {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new McpRegistryError(`MCP implementation '${id}' was not found.`, "UNKNOWN");
    }

    return {
      metadata: cloneMetadata(entry.metadata),
      tools: entry.tools.map(cloneTool),
      register: entry.register
    };
  }

  listTools(id: string): McpToolMetadata[] {
    return this.get(id).tools.map(cloneTool);
  }

  list(): McpMetadata[] {
    return [...this.entries.values()].map(({ metadata }) => cloneMetadata(metadata));
  }
}

export const mcpRegistry = new McpRegistry();
mcpRegistry.register(exampleMcp);

const platformMcpParams = z.object({
  "mcp-id": z.string().trim().min(1)
});

const organizationMcpParams = z.object({
  "organization-id": z.string().trim().min(1),
  "mcp-id": z.string().trim().min(1)
});

function getRegisteredMcp(mcpId: string): McpRegistryEntry {
  try {
    return mcpRegistry.get(mcpId);
  } catch (error) {
    if (error instanceof McpRegistryError && error.code === "UNKNOWN") {
      throw new ApiError(error.message, 404);
    }

    throw error;
  }
}

function createMcpRequestHandler(
  getContext: (request: Request) => McpRuntimeContext,
  getMcpId: (request: Request) => string
): RequestHandler {
  return requestHandler(async (request, response) => {
    const entry = getRegisteredMcp(getMcpId(request));
    await entry.register(request, response, getContext(request));
  });
}

export const platformMcpHandler: RequestHandler = createMcpRequestHandler(
  (request) => ({
    secretProvider: databaseSecretProvider,
    userId: request.user?.id
  }),
  (request) => platformMcpParams.parse(request.params)["mcp-id"]
);

export const organizationMcpHandler: RequestHandler = createMcpRequestHandler(
  (request) => ({
    secretProvider: databaseSecretProvider,
    userId: request.user?.id,
    organizationId: organizationMcpParams.parse(request.params)["organization-id"]
  }),
  (request) => organizationMcpParams.parse(request.params)["mcp-id"]
);

export const exampleMcpHandler: RequestHandler = createMcpRequestHandler(
  (request) => ({
    secretProvider: databaseSecretProvider,
    userId: request.user?.id
  }),
  () => exampleMcp.metadata.id
);
