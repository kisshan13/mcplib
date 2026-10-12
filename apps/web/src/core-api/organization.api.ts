import apiClient from "./api";
import type {
  CreateOrganizationInput,
  OrganizationListResponseEnvelope,
  OrganizationResponseEnvelope,
  UpdateOrganizationInput
} from "./types/organization";
import type {
  AddOrganizationMemberInput,
  OrganizationMemberListResponseEnvelope,
  OrganizationMemberResponseEnvelope,
  UpdateOrganizationMemberInput,
  CreateOrganizationProfileInput,
  OrganizationProfileListResponseEnvelope,
  OrganizationProfileResponseEnvelope,
  UpdateOrganizationProfileInput,
  OrganizationServiceTokenListResponseEnvelope,
  OrganizationServiceTokenResponseEnvelope,
  RegisterOrganizationServiceTokenInput
} from "./types/organization";

export async function apiGetOrganizations() {
  const response = await apiClient.get<OrganizationListResponseEnvelope>("/organizations");
  return response.data.data;
}

export async function apiGetOrganization(id: string) {
  const response = await apiClient.get<OrganizationResponseEnvelope>(`/organizations/${id}`);
  return response.data.data;
}

export async function apiCreateOrganization(input: CreateOrganizationInput) {
  const response = await apiClient.post<OrganizationResponseEnvelope>("/organizations", input);
  return response.data.data;
}

export async function apiUpdateOrganization(id: string, input: UpdateOrganizationInput) {
  const response = await apiClient.patch<OrganizationResponseEnvelope>(
    `/organizations/${id}`,
    input
  );
  return response.data.data;
}

export async function apiGetOrganizationMembers(organizationId: string) {
  const response = await apiClient.get<OrganizationMemberListResponseEnvelope>(
    `/organizations/${organizationId}/members`
  );
  return response.data.data;
}

export async function apiCreateOrganizationMember(
  organizationId: string,
  input: AddOrganizationMemberInput
) {
  const response = await apiClient.post<OrganizationMemberResponseEnvelope>(
    `/organizations/${organizationId}/members`,
    input
  );
  return response.data.data;
}

export async function apiUpdateOrganizationMember(
  organizationId: string,
  memberId: string,
  input: UpdateOrganizationMemberInput
) {
  const response = await apiClient.patch<OrganizationMemberResponseEnvelope>(
    `/organizations/${organizationId}/members/${memberId}`,
    input
  );
  return response.data.data;
}

export async function apiDeleteOrganizationMember(organizationId: string, memberId: string) {
  await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
}

function organizationProfilePath(organizationId: string, profileId?: string) {
  return `/organizations/${organizationId}/profiles${profileId ? `/${profileId}` : ""}`;
}

export async function apiGetOrganizationProfiles(organizationId: string) {
  const response = await apiClient.get<OrganizationProfileListResponseEnvelope>(
    organizationProfilePath(organizationId)
  );
  return response.data.data;
}

export async function apiGetOrganizationProfile(organizationId: string, profileId: string) {
  const response = await apiClient.get<OrganizationProfileResponseEnvelope>(
    organizationProfilePath(organizationId, profileId)
  );
  return response.data.data;
}

export async function apiCreateOrganizationProfile(
  organizationId: string,
  input: CreateOrganizationProfileInput
) {
  const response = await apiClient.post<OrganizationProfileResponseEnvelope>(
    organizationProfilePath(organizationId),
    input
  );
  return response.data.data;
}

export async function apiUpdateOrganizationProfile(
  organizationId: string,
  profileId: string,
  input: UpdateOrganizationProfileInput
) {
  const response = await apiClient.patch<OrganizationProfileResponseEnvelope>(
    organizationProfilePath(organizationId, profileId),
    input
  );
  return response.data.data;
}

export async function apiDeleteOrganizationProfile(organizationId: string, profileId: string) {
  await apiClient.delete(organizationProfilePath(organizationId, profileId));
}

function organizationMemberServiceTokenPath(organizationId: string, userId: string) {
  return `/organizations/${organizationId}/members/${userId}/service-tokens`;
}

export async function apiGetOrganizationServiceTokens(organizationId: string, userId: string) {
  const response = await apiClient.get<OrganizationServiceTokenListResponseEnvelope>(
    organizationMemberServiceTokenPath(organizationId, userId)
  );
  return response.data.data;
}

export async function apiCreateOrganizationServiceToken(
  organizationId: string,
  userId: string,
  input: RegisterOrganizationServiceTokenInput
) {
  const response = await apiClient.post<OrganizationServiceTokenResponseEnvelope>(
    organizationMemberServiceTokenPath(organizationId, userId),
    input
  );
  return response.data.data;
}

export async function apiDeleteOrganizationServiceToken(
  organizationId: string,
  userId: string,
  tokenId: string
) {
  await apiClient.delete(
    `${organizationMemberServiceTokenPath(organizationId, userId)}/${tokenId}`
  );
}

function organizationProfileServiceTokenPath(organizationId: string, profileId: string) {
  return `/organizations/${organizationId}/profiles/${profileId}/service-tokens`;
}

export async function apiGetOrganizationProfileServiceTokens(
  organizationId: string,
  profileId: string
) {
  const response = await apiClient.get<OrganizationServiceTokenListResponseEnvelope>(
    organizationProfileServiceTokenPath(organizationId, profileId)
  );
  return response.data.data;
}

export async function apiCreateOrganizationProfileServiceToken(
  organizationId: string,
  profileId: string,
  input: RegisterOrganizationServiceTokenInput
) {
  const response = await apiClient.post<OrganizationServiceTokenResponseEnvelope>(
    organizationProfileServiceTokenPath(organizationId, profileId),
    input
  );
  return response.data.data;
}

export async function apiDeleteOrganizationProfileServiceToken(
  organizationId: string,
  profileId: string,
  tokenId: string
) {
  await apiClient.delete(
    `${organizationProfileServiceTokenPath(organizationId, profileId)}/${tokenId}`
  );
}
