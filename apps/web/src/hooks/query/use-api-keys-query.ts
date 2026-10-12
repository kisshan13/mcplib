import { useQuery } from "@tanstack/react-query";
import { listApiKeyMcpAccess, listApiKeys } from "@/core-api/api-key.api";

export const apiKeyQueryKeys = {
  all: ["api-keys"] as const,
  list: (params?: { type?: string; status?: string; search?: string; page?: number }) =>
    ["api-keys", "list", params ?? {}] as const,
  access: (id: string) => ["api-keys", id, "mcp-access"] as const
};

export function useApiKeysQuery(params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
}) {
  return useQuery({ queryKey: apiKeyQueryKeys.list(params), queryFn: () => listApiKeys(params) });
}

export function useApiKeyMcpAccessQuery(id: string | null) {
  return useQuery({
    queryKey: apiKeyQueryKeys.access(id ?? "none"),
    queryFn: () => listApiKeyMcpAccess(id!),
    enabled: Boolean(id)
  });
}
