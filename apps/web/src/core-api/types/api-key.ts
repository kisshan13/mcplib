import type { ApiEnvelope } from "./api";

export type ApiKeyType = "platform" | "organization";
export type ApiKeyStatus = "active" | "revoked" | "expired";

export type ApiKeyMcpAccess = {
  mcpId: string;
  displayName: string;
  description: string | null;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  name: string;
  description: string | null;
  type: ApiKeyType;
  organization: { id: string; name: string } | null;
  prefix: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  mcpAccessCount: number;
  mcpAccess: ApiKeyMcpAccess[];
};

export type ApiKeyList = {
  items: ApiKey[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreateApiKeyInput = {
  name: string;
  type: ApiKeyType;
  description?: string | null;
  organizationId?: string;
  expirationDays?: number;
};

export type ApiKeyCreated = { key: ApiKey; secret: string };
export type ApiKeyListEnvelope = ApiEnvelope<ApiKeyList>;
export type ApiKeyEnvelope = ApiEnvelope<ApiKey>;
export type ApiKeyCreatedEnvelope = ApiEnvelope<ApiKeyCreated>;
export type ApiKeyAccessListEnvelope = ApiEnvelope<ApiKeyMcpAccess[]>;
export type ApiKeyAccessEnvelope = ApiEnvelope<ApiKeyMcpAccess>;
export type EmptyEnvelope = ApiEnvelope<null>;
