import type { ApiEnvelope } from "./api";

export type OrganizationServiceTokenAuthenticationMethod =
  "oauth" | "api_key" | "bearer_token" | "basic_auth" | "custom";

export type OrganizationServiceTokenStatus = "active" | "expired" | "revoked" | "invalid";

export type OrganizationServiceToken = {
  id: string;
  secretId: string;
  organizationId: string | null;
  userId: string | null;
  profileId: string | null;
  integrationId: string;
  serviceProvider: string;
  authenticationMethod: OrganizationServiceTokenAuthenticationMethod;
  grantedScopes: string[];
  status: OrganizationServiceTokenStatus;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOrganizationServiceTokenInput = {
  secretId: string;
  integrationId: string;
  serviceProvider?: string;
  authenticationMethod: OrganizationServiceTokenAuthenticationMethod;
  accessToken?: string;
  refreshToken?: string;
  credentialReference?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  grantedScopes?: string[];
};

export type OrganizationServiceTokenResponseEnvelope = ApiEnvelope<OrganizationServiceToken>;
export type OrganizationServiceTokenListResponseEnvelope = ApiEnvelope<OrganizationServiceToken[]>;
