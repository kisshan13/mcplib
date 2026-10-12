import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createApiKey,
  grantApiKeyMcpAccess,
  revokeApiKey,
  revokeApiKeyMcpAccess
} from "@/core-api/api-key.api";
import type { CreateApiKeyInput } from "@/core-api/types/api-key";
import { apiKeyQueryKeys } from "./use-api-keys-query";

export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => createApiKey(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all })
  });
}

export function useRevokeApiKeyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: (_key, id) => {
      void queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.access(id) });
    }
  });
}

export function useGrantApiKeyMcpAccessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mcpId }: { id: string; mcpId: string }) => grantApiKeyMcpAccess(id, mcpId),
    onSuccess: (_access, { id }) =>
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.access(id) })
  });
}

export function useRevokeApiKeyMcpAccessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mcpId }: { id: string; mcpId: string }) => revokeApiKeyMcpAccess(id, mcpId),
    onSuccess: (_result, { id }) =>
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.access(id) })
  });
}
