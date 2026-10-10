import type { Request, Response } from "express";
import type { z } from "zod";
import type {
  SecretAccessContext,
  SecretProvider,
  SecretProviderConfiguration
} from "@packages/mcplib-core";

export interface McpToolkitOpts {
  id?: string;
  name: string;
  version: string;
  description?: string;
  displayName?: string;
  serviceProvider?: string;
  capabilities?: readonly string[];
  available?: boolean;
  secretProvider?: SecretProvider;
  secretProviderConfiguration?: SecretProviderConfiguration;
}

export interface McpMetadata {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  version?: string;
  serviceProvider?: string;
  capabilities: readonly string[];
  available: boolean;
  secretProviderConfiguration?: SecretProviderConfiguration;
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

export interface McpToolDefinition<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema: TOutput;
  execute(input: z.infer<TInput>, context: McpRuntimeContext): Promise<z.infer<TOutput>>;
}
