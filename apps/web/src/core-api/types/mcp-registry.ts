import type { ApiEnvelope } from "./api";

export type McpMetadata = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  version?: string;
  serviceProvider?: string;
  capabilities: string[];
  secretProviderConfiguration?: {
    type: "direct" | "configuration";
    secretId: string;
    inputSchema: Record<string, unknown>;
    oauth?: {
      authorizationUrl?: string;
      tokenUrl?: string;
      redirectUri?: string;
      scopes: string[];
    };
  };
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
