import apiClient from "./api";
import type { ExampleQuery, ExampleResponseEnvelope } from "./types/example";

export async function getExample(params?: ExampleQuery) {
  const response = await apiClient.get<ExampleResponseEnvelope>("/example", { params });
  return response.data.data;
}
