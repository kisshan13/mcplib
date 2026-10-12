import { useQuery } from "@tanstack/react-query";
import { listOrganizationProfileServiceTokens } from "@/core-api/organization-profile-service-tokens.api";

export const organizationProfileServiceTokenQueryKeys = {
  all: ["organization-profile-service-tokens"] as const,
  profile: (organizationId: string, profileId: string) =>
    ["organization-profile-service-tokens", organizationId, profileId] as const
};

export function useOrganizationProfileServiceTokensQuery(
  organizationId: string,
  profileId: string
) {
  return useQuery({
    queryKey: organizationProfileServiceTokenQueryKeys.profile(organizationId, profileId),
    queryFn: () => listOrganizationProfileServiceTokens(organizationId, profileId),
    enabled: Boolean(organizationId && profileId)
  });
}
