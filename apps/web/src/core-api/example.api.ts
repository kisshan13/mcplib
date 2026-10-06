import apiClient from "./api";
import type { ExampleResponse } from "./types";

export async function getExample(): Promise<ExampleResponse> {
  const response = await apiClient.get<{ data: ExampleResponse }>("/example");
  return response.data.data;
}
