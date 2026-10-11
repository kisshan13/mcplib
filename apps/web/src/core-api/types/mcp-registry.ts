import type { ApiEnvelope } from "./api";

export type McpConfigurationContext =
  | {
      type: "platform";
      id?: undefined;
    }
  | {
      type: "organization";
      id: string;
    };

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

export type McpConfiguration = {
  id: string;
  mcpId: string;
  scope: "platform" | "organization";
  organizationId: string | null;
  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type McpMetadataListResponseEnvelope = ApiEnvelope<McpMetadata[]>;
export type McpMetadataResponseEnvelope = ApiEnvelope<McpMetadata>;
export type McpToolsListResponseEnvelope = ApiEnvelope<McpToolMetadata[]>;
export type McpConfigurationResponseEnvelope = ApiEnvelope<McpConfiguration | null>;

export type McpConfigurationStatus = {
  mcpId: string;
  displayName: string;
  configured: boolean;
  platformConfigurationReady: boolean;
  status: "connected" | "needs_authorization" | "not_configured" | "not_required";
  authentication: "oauth" | "direct" | "configuration" | null;
};

export type McpConfigurationStatusListResponseEnvelope = ApiEnvelope<McpConfigurationStatus[]>;
