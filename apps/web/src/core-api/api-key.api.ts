import apiClient from "./api";
import type {
  ApiKeyAccessEnvelope,
  ApiKeyAccessListEnvelope,
  ApiKeyCreatedEnvelope,
  ApiKeyEnvelope,
  ApiKeyListEnvelope,
  CreateApiKeyInput
} from "./types/api-key";

export async function apiGetApiKeys(params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
}) {
  const response = await apiClient.get<ApiKeyListEnvelope>("/api-keys", { params });
  return response.data.data;
}

export async function apiGetApiKey(id: string) {
  const response = await apiClient.get<ApiKeyEnvelope>(`/api-keys/${id}`);
  return response.data.data;
}

export async function apiCreateApiKey(input: CreateApiKeyInput) {
  const response = await apiClient.post<ApiKeyCreatedEnvelope>("/api-keys", input);
  return response.data.data;
}

export async function apiRevokeApiKey(id: string) {
  const response = await apiClient.post<ApiKeyEnvelope>(`/api-keys/${id}/revoke`);
  return response.data.data;
}

export async function apiGetApiKeyMcpAccess(id: string) {
  const response = await apiClient.get<ApiKeyAccessListEnvelope>(`/api-keys/${id}/mcp-access`);
  return response.data.data;
}

export async function apiGrantApiKeyMcpAccess(id: string, mcpId: string) {
  const response = await apiClient.post<ApiKeyAccessEnvelope>(`/api-keys/${id}/mcp-access`, {
    mcpId
  });
  return response.data.data;
}

export async function apiRevokeApiKeyMcpAccess(id: string, mcpId: string) {
  await apiClient.delete(`/api-keys/${id}/mcp-access/${mcpId}`);
}
