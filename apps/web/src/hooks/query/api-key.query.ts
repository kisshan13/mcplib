import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWrappedMutation } from "@/query-provider";
import {
  apiCreateApiKey,
  apiGetApiKey,
  apiGetApiKeyMcpAccess,
  apiGetApiKeys,
  apiGrantApiKeyMcpAccess,
  apiRevokeApiKey,
  apiRevokeApiKeyMcpAccess
} from "@/core-api/api-key.api";
import type { CreateApiKeyInput } from "@/core-api/types/api-key";

export const apiKeyQueryKeys = {
  all: ["api-keys"] as const,
  list: (params?: { type?: string; status?: string; search?: string; page?: number }) =>
    ["api-keys", "list", params ?? {}] as const,
  detail: (id: string) => ["api-keys", id] as const,
  access: (id: string) => ["api-keys", id, "mcp-access"] as const
};

export function useApiKeysQuery(params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
}) {
  return useQuery({ queryKey: apiKeyQueryKeys.list(params), queryFn: () => apiGetApiKeys(params) });
}

export function useApiKeyQuery(id: string | null) {
  return useQuery({
    queryKey: apiKeyQueryKeys.detail(id ?? "none"),
    queryFn: () => apiGetApiKey(id!),
    enabled: Boolean(id)
  });
}

export function useApiKeyMcpAccessQuery(id: string | null) {
  return useQuery({
    queryKey: apiKeyQueryKeys.access(id ?? "none"),
    queryFn: () => apiGetApiKeyMcpAccess(id!),
    enabled: Boolean(id)
  });
}

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<CreateApiKeyInput>(
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all }) },
    (input: CreateApiKeyInput) => apiCreateApiKey(input)
  );
}

export function useRevokeApiKeyMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<string>(
    {
      onSuccess: (_key, id: string) => {
        void queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
        void queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.access(id) });
      }
    },
    (id: string) => apiRevokeApiKey(id)
  );
}

export function useGrantApiKeyMcpAccessMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ id: string; mcpId: string }>(
    {
      onSuccess: (_access, { id }: { id: string; mcpId: string }) =>
        queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.access(id) })
    },
    ({ id, mcpId }: { id: string; mcpId: string }) => apiGrantApiKeyMcpAccess(id, mcpId)
  );
}

export function useRevokeApiKeyMcpAccessMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ id: string; mcpId: string }>(
    {
      onSuccess: (_result, { id }: { id: string; mcpId: string }) =>
        queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.access(id) })
    },
    ({ id, mcpId }: { id: string; mcpId: string }) => apiRevokeApiKeyMcpAccess(id, mcpId)
  );
}
