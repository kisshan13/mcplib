import { useQuery } from "@tanstack/react-query";
import { getExample } from "@/core-api/example.api";

export function useExampleQuery() {
  return useQuery({
    queryKey: ["example"],
    queryFn: getExample
  });
}
