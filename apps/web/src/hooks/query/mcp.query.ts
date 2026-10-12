import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWrappedMutation } from "@/query-provider";
import {
  apiGetMcp,
  apiGetMcpConfiguration,
  apiGetMcpConfigurationStatuses,
  apiGetMcpRegistry,
  apiGetMcpTools,
  apiSaveMcpConfiguration,
  apiSaveMcpDirectCredential
} from "@/core-api/mcp.api";
import type { McpConfigurationContext } from "@/core-api/types/mcp-registry";

export const mcpQueryKeys = {
  all: ["mcps"] as const,
  detail: (id: string) => ["mcps", id] as const,
  tools: (id: string) => ["mcps", id, "tools"] as const,
  configurationStatuses: () => ["mcps", "configuration-status"] as const
};

export function useMcpRegistryQuery() {
  return useQuery({ queryKey: mcpQueryKeys.all, queryFn: apiGetMcpRegistry });
}

export function useMcpQuery(id: string) {
  return useQuery({
    queryKey: mcpQueryKeys.detail(id),
    queryFn: () => apiGetMcp(id),
    enabled: Boolean(id)
  });
}

export function useMcpToolsQuery(id: string) {
  return useQuery({
    queryKey: mcpQueryKeys.tools(id),
    queryFn: () => apiGetMcpTools(id),
    enabled: Boolean(id)
  });
}

export function useMcpConfigurationStatusesQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: mcpQueryKeys.configurationStatuses(),
    queryFn: apiGetMcpConfigurationStatuses,
    enabled: options.enabled ?? true,
    refetchOnMount: "always"
  });
}

export function useMcpConfigurationQuery(id: string, context: McpConfigurationContext) {
  return useQuery({
    queryKey: [...mcpQueryKeys.detail(id), "configuration", context] as const,
    queryFn: () => apiGetMcpConfiguration(id, context),
    enabled: Boolean(id && context)
  });
}

export function useSaveMcpConfigurationMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{
    id: string;
    context: McpConfigurationContext;
    values: Record<string, unknown>;
  }>(
    {
      onSuccess: (
        _configuration,
        input: {
          id: string;
          context: McpConfigurationContext;
          values: Record<string, unknown>;
        }
      ) => {
        void queryClient.invalidateQueries({ queryKey: mcpQueryKeys.all });
        void queryClient.invalidateQueries({
          queryKey: [...mcpQueryKeys.detail(input.id), "configuration", input.context]
        });
      }
    },
    (input: { id: string; context: McpConfigurationContext; values: Record<string, unknown> }) =>
      apiSaveMcpConfiguration(input.id, input.context, input.values)
  );
}

export function useMcpDirectCredentialMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{
    id: string;
    context: McpConfigurationContext;
    values: Record<string, unknown>;
  }>(
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: mcpQueryKeys.all });
      }
    },
    (input: { id: string; context: McpConfigurationContext; values: Record<string, unknown> }) =>
      apiSaveMcpDirectCredential(input.id, input.context, input.values)
  );
}
