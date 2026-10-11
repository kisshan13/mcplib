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

export async function listMcpRegistry() {
  const response = await apiClient.get<McpMetadataListResponseEnvelope>("/mcps");
  return response.data.data;
}

export async function getMcpRegistryEntry(id: string) {
  const response = await apiClient.get<McpMetadataResponseEnvelope>(`/mcps/${id}`);
  return response.data.data;
}

export async function listMcpTools(id: string) {
  const response = await apiClient.get<McpToolsListResponseEnvelope>(`/mcps/${id}/tools`);
  return response.data.data;
}

export async function getMcpConfiguration(id: string, context: McpConfigurationContext) {
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

export async function saveMcpConfiguration(
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

export async function saveMcpDirectCredential(
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

export async function listMcpConfigurationStatuses() {
  const response = await apiClient.get<McpConfigurationStatusListResponseEnvelope>(
    "/mcps/configuration/status"
  );
  return response.data.data;
}
