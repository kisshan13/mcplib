import { useQuery } from "@tanstack/react-query";
import { listOrganizationProfiles } from "@/core-api/organization-profiles.api";

export const organizationProfileQueryKeys = {
  all: ["organization-profiles"] as const,
  organization: (organizationId: string) => ["organization-profiles", organizationId] as const
};

export function useOrganizationProfilesQuery(organizationId: string) {
  return useQuery({
    queryKey: organizationProfileQueryKeys.organization(organizationId),
    queryFn: () => listOrganizationProfiles(organizationId),
    enabled: Boolean(organizationId)
  });
}
