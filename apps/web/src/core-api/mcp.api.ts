import apiClient from "./api";
import type {
  McpMetadataListResponseEnvelope,
  McpMetadataResponseEnvelope,
  McpToolsListResponseEnvelope,
  McpConfigurationContext,
  McpConfigurationResponseEnvelope,
  McpConfigurationStatusListResponseEnvelope,
  McpDirectCredentialResponseEnvelope
} from "./types/mcp-registry";

export async function apiGetMcpRegistry() {
  const response = await apiClient.get<McpMetadataListResponseEnvelope>("/mcps");
  return response.data.data;
}

export async function apiGetMcp(id: string) {
  const response = await apiClient.get<McpMetadataResponseEnvelope>(`/mcps/${id}`);
  return response.data.data;
}

export async function apiGetMcpTools(id: string) {
  const response = await apiClient.get<McpToolsListResponseEnvelope>(`/mcps/${id}/tools`);
  return response.data.data;
}

export async function apiGetMcpConfiguration(id: string, context: McpConfigurationContext) {
  const response = await apiClient.get<McpConfigurationResponseEnvelope>(
    `/mcps/${id}/configuration`,
    {
      params: {
        context: context.type,
        ...(context.type === "organization" ? { organizationId: context.id } : {})
      }
    }
  );
  return response.data.data;
}

export async function apiSaveMcpConfiguration(
  id: string,
  context: McpConfigurationContext,
  values: Record<string, unknown>
) {
  const response = await apiClient.put<McpConfigurationResponseEnvelope>(
    `/mcps/${id}/configuration`,
    { context, values }
  );
  return response.data.data;
}

export async function apiSaveMcpDirectCredential(
  id: string,
  context: McpConfigurationContext,
  values: Record<string, unknown>
) {
  const response = await apiClient.put<McpDirectCredentialResponseEnvelope>(
    `/mcps/${id}/credential`,
    { context, values }
  );
  return response.data.data;
}

export async function apiGetMcpConfigurationStatuses() {
  const response = await apiClient.get<McpConfigurationStatusListResponseEnvelope>(
    "/mcps/configuration/status"
  );
  return response.data.data;
}
