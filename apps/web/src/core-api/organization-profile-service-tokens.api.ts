import apiClient from "./api";
import type {
  OrganizationServiceTokenListResponseEnvelope,
  OrganizationServiceTokenResponseEnvelope,
  RegisterOrganizationServiceTokenInput
} from "./types/organization-service-token";

function serviceTokenPath(organizationId: string, profileId: string) {
  return `/organizations/${organizationId}/profiles/${profileId}/service-tokens`;
}

export async function listOrganizationProfileServiceTokens(
  organizationId: string,
  profileId: string
) {
  const response = await apiClient.get<OrganizationServiceTokenListResponseEnvelope>(
    serviceTokenPath(organizationId, profileId)
  );
  return response.data.data;
}

export async function registerOrganizationProfileServiceToken(
  organizationId: string,
  profileId: string,
  input: RegisterOrganizationServiceTokenInput
) {
  const response = await apiClient.post<OrganizationServiceTokenResponseEnvelope>(
    serviceTokenPath(organizationId, profileId),
    input
  );
  return response.data.data;
}

export async function revokeOrganizationProfileServiceToken(
  organizationId: string,
  profileId: string,
  tokenId: string
) {
  await apiClient.delete(`${serviceTokenPath(organizationId, profileId)}/${tokenId}`);
}
