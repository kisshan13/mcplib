import apiClient from "./api";
import type {
  CreateOrganizationInput,
  OrganizationListResponseEnvelope,
  OrganizationResponseEnvelope,
  UpdateOrganizationInput
} from "./types/organization";

export async function listOrganizations() {
  const response = await apiClient.get<OrganizationListResponseEnvelope>("/organizations");
  return response.data.data;
}

export async function getOrganization(id: string) {
  const response = await apiClient.get<OrganizationResponseEnvelope>(`/organizations/${id}`);
  return response.data.data;
}

export async function createOrganization(input: CreateOrganizationInput) {
  const response = await apiClient.post<OrganizationResponseEnvelope>("/organizations", input);
  return response.data.data;
}

export async function updateOrganization(id: string, input: UpdateOrganizationInput) {
  const response = await apiClient.patch<OrganizationResponseEnvelope>(
    `/organizations/${id}`,
    input
  );
  return response.data.data;
}
