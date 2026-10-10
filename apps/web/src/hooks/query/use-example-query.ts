import { useQuery } from "@tanstack/react-query";
import { getExample } from "@/core-api/example.api";
import type { ExampleQuery } from "@/core-api/types/example";

export function useExampleQuery(params?: ExampleQuery) {
  return useQuery({
    queryKey: ["example", params],
    queryFn: () => getExample(params)
  });
}
