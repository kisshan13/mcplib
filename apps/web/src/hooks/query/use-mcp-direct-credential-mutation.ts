import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMcpDirectCredential } from "@/core-api/mcp-registry.api";
import type { McpConfigurationContext } from "@/core-api/types/mcp-registry";
import { mcpQueryKeys } from "./use-mcp-registry-query";

export function useMcpDirectCredentialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      context: McpConfigurationContext;
      values: Record<string, unknown>;
    }) => saveMcpDirectCredential(input.id, input.context, input.values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mcpQueryKeys.all });
    }
  });
}
