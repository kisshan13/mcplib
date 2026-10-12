import { useQuery } from "@tanstack/react-query";
import { listOrganizationServiceTokens } from "@/core-api/organization-service-tokens.api";

export const organizationServiceTokenQueryKeys = {
  all: ["organization-service-tokens"] as const,
  member: (organizationId: string, userId: string) =>
    ["organization-service-tokens", organizationId, userId] as const
};

export function useOrganizationServiceTokensQuery(organizationId: string, userId: string) {
  return useQuery({
    queryKey: organizationServiceTokenQueryKeys.member(organizationId, userId),
    queryFn: () => listOrganizationServiceTokens(organizationId, userId),
    enabled: Boolean(organizationId && userId)
  });
}
