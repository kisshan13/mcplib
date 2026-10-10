import { useQuery } from "@tanstack/react-query";
import { listOrganizations } from "@/core-api/organization.api";

export const organizationQueryKeys = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const
};

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: organizationQueryKeys.all,
    queryFn: listOrganizations
  });
}
