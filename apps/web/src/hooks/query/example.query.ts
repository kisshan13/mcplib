import { useQuery } from "@tanstack/react-query";
import { apiGetExample } from "@/core-api/example.api";
import type { ExampleQuery } from "@/core-api/types/example";

export function useExampleQuery(params?: ExampleQuery) {
  return useQuery({
    queryKey: ["example", params ?? {}] as const,
    queryFn: () => apiGetExample(params)
  });
}
