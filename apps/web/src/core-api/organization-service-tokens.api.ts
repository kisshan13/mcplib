import apiClient from "./api";
import type {
  OrganizationServiceTokenListResponseEnvelope,
  OrganizationServiceTokenResponseEnvelope,
  RegisterOrganizationServiceTokenInput
} from "./types/organization-service-token";

function serviceTokenPath(organizationId: string, userId: string) {
  return `/organizations/${organizationId}/members/${userId}/service-tokens`;
}

export async function listOrganizationServiceTokens(organizationId: string, userId: string) {
  const response = await apiClient.get<OrganizationServiceTokenListResponseEnvelope>(
    serviceTokenPath(organizationId, userId)
  );
  return response.data.data;
}

export async function registerOrganizationServiceToken(
  organizationId: string,
  userId: string,
  input: RegisterOrganizationServiceTokenInput
) {
  const response = await apiClient.post<OrganizationServiceTokenResponseEnvelope>(
    serviceTokenPath(organizationId, userId),
    input
  );
  return response.data.data;
}

export async function revokeOrganizationServiceToken(
  organizationId: string,
  userId: string,
  tokenId: string
) {
  await apiClient.delete(`${serviceTokenPath(organizationId, userId)}/${tokenId}`);
}
