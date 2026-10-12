import { useQuery } from "@tanstack/react-query";
import { listOrganizationMembers } from "@/core-api/organization-members.api";

export const organizationMemberQueryKeys = {
  all: ["organization-members"] as const,
  organization: (organizationId: string) => ["organization-members", organizationId] as const
};

export function useOrganizationMembersQuery(organizationId: string) {
  return useQuery({
    queryKey: organizationMemberQueryKeys.organization(organizationId),
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: Boolean(organizationId)
  });
}
