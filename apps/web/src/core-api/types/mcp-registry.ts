import type { ApiEnvelope } from "./api";

export type McpMetadata = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  version?: string;
  serviceProvider?: string;
  supportedAuthMethods: string[];
  requiredScopes: string[];
  capabilities: string[];
  configurationRequirements: string[];
  available: boolean;
};

export type McpToolMetadata = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
};

export type McpMetadataListResponseEnvelope = ApiEnvelope<McpMetadata[]>;
export type McpMetadataResponseEnvelope = ApiEnvelope<McpMetadata>;
export type McpToolsListResponseEnvelope = ApiEnvelope<McpToolMetadata[]>;
