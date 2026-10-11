import type { Request, RequestHandler } from "express";
import type { McpMetadata, McpToolMetadata, McpToolkitRegister } from "@packages/mcp-core";
import type { McpRuntimeContext } from "@packages/mcp-core";
import { ApiError } from "./error.js";
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

export type McpConfigurationProviderContext =
  { type: "platform" } | { type: "organization"; organizationId: string };

export type McpConfigurationProvider<TConfiguration extends object = object> = (
  context: McpConfigurationProviderContext
) => TConfiguration | null | Promise<TConfiguration | null>;

export interface McpConfigurationProviders {
  platformConfigProvider?: McpConfigurationProvider;
  organizationConfigProvider?: McpConfigurationProvider;
}

export type McpRegistryEntry = Pick<McpToolkitRegister, "metadata" | "tools" | "register"> & {
  configurationProviders?: McpConfigurationProviders;
};

function cloneMetadata(metadata: McpMetadata): McpMetadata {
  return {
    ...metadata,
    capabilities: [...metadata.capabilities],
    ...(metadata.secretProviderConfiguration
      ? { secretProviderConfiguration: metadata.secretProviderConfiguration.clone() }
      : {})
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

  register(entry: McpRegistryEntry, configurationProviders?: McpConfigurationProviders): this {
    const id = entry.metadata.id;
    if (this.entries.has(id)) {
      throw new McpRegistryError(`MCP implementation '${id}' is already registered.`, "DUPLICATE");
    }

    this.entries.set(id, {
      metadata: cloneMetadata(entry.metadata),
      tools: entry.tools.map(cloneTool),
      register: entry.register,
      ...(configurationProviders ? { configurationProviders } : {})
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
      register: entry.register,
      ...(entry.configurationProviders
        ? { configurationProviders: entry.configurationProviders }
        : {})
    };
  }

  listTools(id: string): McpToolMetadata[] {
    return this.get(id).tools.map(cloneTool);
  }

  list(): McpMetadata[] {
    return [...this.entries.values()].map(({ metadata }) => cloneMetadata(metadata));
  }
}

export function getRegisteredMcp(registry: McpRegistry, mcpId: string): McpRegistryEntry {
  try {
    return registry.get(mcpId);
  } catch (error) {
    if (error instanceof McpRegistryError && error.code === "UNKNOWN") {
      throw new ApiError(error.message, 404);
    }

    throw error;
  }
}

export async function resolveMcpConfiguration(
  entry: McpRegistryEntry,
  context: McpConfigurationProviderContext
): Promise<object | null> {
  const provider =
    context.type === "platform"
      ? entry.configurationProviders?.platformConfigProvider
      : entry.configurationProviders?.organizationConfigProvider;

  return provider ? provider(context) : null;
}

export function createMcpRequestHandler(
  registry: McpRegistry,
  getContext: (request: Request) => McpRuntimeContext,
  getMcpId: (request: Request) => string
): RequestHandler {
  return requestHandler(async (request, response) => {
    const entry = getRegisteredMcp(registry, getMcpId(request));
    await entry.register(request, response, getContext(request));
  });
}
