import type { Request, Response } from "express";
import { z } from "zod";

import { unavailableSecretProvider } from "@packages/mcplib-core";

import { McpServer, type ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type {
  McpMetadata,
  McpRuntimeContext,
  McpToolDefinition,
  McpToolMetadata,
  McpToolkitOpts,
  McpToolkitRegister
} from "./types.js";

export class McpToolkit {
  private readonly serverOptions: McpToolkitOpts;
  private readonly registerToolHandlers: Array<
    (server: McpServer, context: McpRuntimeContext) => void
  > = [];
  private readonly toolMetadata: McpToolMetadata[] = [];
  private readonly metadata: McpMetadata;

  constructor(opts: McpToolkitOpts) {
    this.serverOptions = opts;
    this.metadata = {
      id: opts.id ?? opts.name,
      name: opts.name,
      displayName: opts.displayName ?? opts.name,
      description: opts.description,
      version: opts.version,
      serviceProvider: opts.serviceProvider,
      capabilities: [...(opts.capabilities ?? [])],
      available: opts.available ?? true,
      ...(opts.secretProviderConfiguration
        ? { secretProviderConfiguration: opts.secretProviderConfiguration.clone() }
        : {})
    };
  }

  getMetadata(): McpMetadata {
    return {
      ...this.metadata,
      capabilities: [...this.metadata.capabilities],
      ...(this.metadata.secretProviderConfiguration
        ? { secretProviderConfiguration: this.metadata.secretProviderConfiguration.clone() }
        : {})
    };
  }

  registerTool<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
    definition: McpToolDefinition<TInput, TOutput>
  ): this {
    this.toolMetadata.push({
      name: definition.name,
      description: definition.description,
      inputSchema: z.toJSONSchema(definition.inputSchema) as Record<string, unknown>,
      outputSchema: z.toJSONSchema(definition.outputSchema) as Record<string, unknown>
    });

    this.registerToolHandlers.push((server, runtimeContext) => {
      const callback: ToolCallback<z.ZodTypeAny> = async (input: unknown) => {
        const result = await definition.execute(input as z.infer<TInput>, runtimeContext);

        return {
          structuredContent: result as Record<string, unknown>,
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result)
            }
          ]
        };
      };

      server.registerTool(
        definition.name,
        {
          description: definition.description,
          inputSchema: definition.inputSchema,
          outputSchema: definition.outputSchema
        },
        callback as ToolCallback<TInput>
      );
    });

    return this;
  }

  getTools(): McpToolMetadata[] {
    return this.toolMetadata.map((tool) => ({
      ...tool,
      inputSchema: { ...tool.inputSchema },
      outputSchema: { ...tool.outputSchema }
    }));
  }

  registerMcp = async (req: Request, res: Response, context?: McpRuntimeContext): Promise<void> => {
    const runtimeContext: McpRuntimeContext = context ?? {
      secretProvider: this.serverOptions.secretProvider ?? unavailableSecretProvider
    };
    const server = new McpServer({
      name: this.serverOptions.name,
      version: this.serverOptions.version,
      description: this.serverOptions.description
    });
    this.registerToolHandlers.forEach((registerTool) => registerTool(server, runtimeContext));

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);

    await transport.handleRequest(req, res, req.body);
  };

  asRegister(): McpToolkitRegister {
    return {
      metadata: this.getMetadata(),
      tools: this.getTools(),
      register: this.registerMcp
    };
  }
}
