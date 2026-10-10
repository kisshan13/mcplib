import apiClient from "./api";
import type {
  McpMetadataListResponseEnvelope,
  McpMetadataResponseEnvelope,
  McpToolsListResponseEnvelope
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
