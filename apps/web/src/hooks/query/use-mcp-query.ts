import { useQuery } from "@tanstack/react-query";
import { getMcpRegistryEntry } from "@/core-api/mcp-registry.api";
import { mcpQueryKeys } from "./use-mcp-registry-query";

export function useMcpQuery(id: string) {
  return useQuery({
    queryKey: mcpQueryKeys.detail(id),
    queryFn: () => getMcpRegistryEntry(id),
    enabled: Boolean(id)
  });
}
