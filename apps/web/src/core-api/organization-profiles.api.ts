import apiClient from "./api";
import type {
  CreateOrganizationProfileInput,
  OrganizationProfileListResponseEnvelope,
  OrganizationProfileResponseEnvelope,
  UpdateOrganizationProfileInput
} from "./types/organization-profile";

function profilePath(organizationId: string, profileId?: string) {
  return `/organizations/${organizationId}/profiles${profileId ? `/${profileId}` : ""}`;
}

export async function listOrganizationProfiles(organizationId: string) {
  const response = await apiClient.get<OrganizationProfileListResponseEnvelope>(
    profilePath(organizationId)
  );
  return response.data.data;
}

export async function getOrganizationProfile(organizationId: string, profileId: string) {
  const response = await apiClient.get<OrganizationProfileResponseEnvelope>(
    profilePath(organizationId, profileId)
  );
  return response.data.data;
}

export async function createOrganizationProfile(
  organizationId: string,
  input: CreateOrganizationProfileInput
) {
  const response = await apiClient.post<OrganizationProfileResponseEnvelope>(
    profilePath(organizationId),
    input
  );
  return response.data.data;
}

export async function updateOrganizationProfile(
  organizationId: string,
  profileId: string,
  input: UpdateOrganizationProfileInput
) {
  const response = await apiClient.patch<OrganizationProfileResponseEnvelope>(
    profilePath(organizationId, profileId),
    input
  );
  return response.data.data;
}

export async function removeOrganizationProfile(organizationId: string, profileId: string) {
  await apiClient.delete(profilePath(organizationId, profileId));
}
