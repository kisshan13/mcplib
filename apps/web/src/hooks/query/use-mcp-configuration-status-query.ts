import { useQuery } from "@tanstack/react-query";
import { listMcpConfigurationStatuses } from "@/core-api/mcp-registry.api";
import { mcpQueryKeys } from "./use-mcp-registry-query";

export function useMcpConfigurationStatusesQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...mcpQueryKeys.all, "configuration-status"] as const,
    queryFn: listMcpConfigurationStatuses,
    enabled: options.enabled ?? true,
    refetchOnMount: "always"
  });
}
