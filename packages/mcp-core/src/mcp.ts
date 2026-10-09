import type { Request, Response } from "express";
import { z } from "zod";

import {
  unavailableSecretProvider,
  type SecretAccessContext,
  type SecretProvider
} from "@packages/mcplib-core";

import { McpServer, type ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export interface McpToolkitOpts {
  id?: string;
  name: string;
  version: string;
  description?: string;
  displayName?: string;
  serviceProvider?: string;
  supportedAuthMethods?: readonly McpAuthenticationMethod[];
  requiredScopes?: readonly string[];
  capabilities?: readonly string[];
  configurationRequirements?: readonly string[];
  available?: boolean;
  secretProvider?: SecretProvider;
}

export type McpAuthenticationMethod =
  "oauth" | "api-key" | "bearer-token" | "basic-auth" | "custom";

export interface McpMetadata {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  version?: string;
  serviceProvider?: string;
  supportedAuthMethods: readonly McpAuthenticationMethod[];
  requiredScopes: readonly string[];
  capabilities: readonly string[];
  configurationRequirements: readonly string[];
  available: boolean;
}

export interface McpRuntimeContext extends SecretAccessContext {
  secretProvider: SecretProvider;
}

export interface McpToolMetadata {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface McpToolkitRegister {
  metadata: McpMetadata;
  tools: readonly McpToolMetadata[];
  register: (req: Request, res: Response, context?: McpRuntimeContext) => Promise<void>;
}

interface ToolDefinition<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema: TOutput;

  execute(input: z.infer<TInput>, context: McpRuntimeContext): Promise<z.infer<TOutput>>;
}

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
      supportedAuthMethods: [...(opts.supportedAuthMethods ?? [])],
      requiredScopes: [...(opts.requiredScopes ?? [])],
      capabilities: [...(opts.capabilities ?? [])],
      configurationRequirements: [...(opts.configurationRequirements ?? [])],
      available: opts.available ?? true
    };
  }

  getMetadata(): McpMetadata {
    return {
      ...this.metadata,
      supportedAuthMethods: [...this.metadata.supportedAuthMethods],
      requiredScopes: [...this.metadata.requiredScopes],
      capabilities: [...this.metadata.capabilities],
      configurationRequirements: [...this.metadata.configurationRequirements]
    };
  }

  registerTool<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
    definition: ToolDefinition<TInput, TOutput>
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
