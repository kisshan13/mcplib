import type { ApiEnvelope } from "./api";

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationInput = {
  name: string;
  description?: string | null;
};

export type UpdateOrganizationInput = {
  name?: string;
  description?: string | null;
};

export type OrganizationResponseEnvelope = ApiEnvelope<Organization>;
export type OrganizationListResponseEnvelope = ApiEnvelope<Organization[]>;

export type OrganizationMemberRole = "owner" | "administrator" | "member";

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type AddOrganizationMemberInput = {
  userId?: string;
  email?: string;
  role?: Exclude<OrganizationMemberRole, "owner">;
};

export type UpdateOrganizationMemberInput = {
  role: Exclude<OrganizationMemberRole, "owner">;
};

export type OrganizationMemberResponseEnvelope = ApiEnvelope<OrganizationMember>;
export type OrganizationMemberListResponseEnvelope = ApiEnvelope<OrganizationMember[]>;

export type OrganizationProfile = {
  id: string;
  organizationId: string;
  name: string;
  profilePicUrl: string | null;
  email: string | null;
  metadata: Record<string, unknown> | null;
  providerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationProfileInput = {
  name: string;
  profilePicUrl?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
  providerId: string;
};

export type UpdateOrganizationProfileInput = Partial<CreateOrganizationProfileInput>;
export type OrganizationProfileResponseEnvelope = ApiEnvelope<OrganizationProfile>;
export type OrganizationProfileListResponseEnvelope = ApiEnvelope<OrganizationProfile[]>;

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
