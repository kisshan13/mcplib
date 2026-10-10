import { useQuery } from "@tanstack/react-query";
import { listMcpTools } from "@/core-api/mcp-registry.api";
import { mcpQueryKeys } from "./use-mcp-registry-query";

export function useMcpToolsQuery(id: string) {
  return useQuery({
    queryKey: mcpQueryKeys.tools(id),
    queryFn: () => listMcpTools(id),
    enabled: Boolean(id)
  });
}
