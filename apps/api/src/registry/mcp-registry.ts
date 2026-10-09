import type { McpMetadata, McpToolMetadata, McpToolkitRegister } from "@packages/mcp-core";
import exampleMcp from "@packages/example-mcp";

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
