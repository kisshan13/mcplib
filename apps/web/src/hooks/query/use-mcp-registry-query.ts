import { useQuery } from "@tanstack/react-query";
import { listMcpRegistry } from "@/core-api/mcp-registry.api";

export const mcpQueryKeys = {
  all: ["mcps"] as const,
  detail: (id: string) => ["mcps", id] as const,
  tools: (id: string) => ["mcps", id, "tools"] as const
};

export function useMcpRegistryQuery() {
  return useQuery({
    queryKey: mcpQueryKeys.all,
    queryFn: listMcpRegistry
  });
}
