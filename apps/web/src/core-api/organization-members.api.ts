import apiClient from "./api";
import type {
  AddOrganizationMemberInput,
  OrganizationMemberListResponseEnvelope,
  OrganizationMemberResponseEnvelope,
  UpdateOrganizationMemberInput
} from "./types/organization-member";

export async function listOrganizationMembers(organizationId: string) {
  const response = await apiClient.get<OrganizationMemberListResponseEnvelope>(
    `/organizations/${organizationId}/members`
  );
  return response.data.data;
}

export async function addOrganizationMember(
  organizationId: string,
  input: AddOrganizationMemberInput
) {
  const response = await apiClient.post<OrganizationMemberResponseEnvelope>(
    `/organizations/${organizationId}/members`,
    input
  );
  return response.data.data;
}

export async function updateOrganizationMember(
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

export async function removeOrganizationMember(organizationId: string, memberId: string) {
  await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
}
