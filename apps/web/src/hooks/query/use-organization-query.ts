import { useQuery } from "@tanstack/react-query";
import { getOrganization } from "@/core-api/organization.api";
import { organizationQueryKeys } from "./use-organizations-query";

export function useOrganizationQuery(id: string) {
  return useQuery({
    queryKey: organizationQueryKeys.detail(id),
    queryFn: () => getOrganization(id),
    enabled: Boolean(id)
  });
}
