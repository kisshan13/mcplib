import { useQuery } from "@tanstack/react-query";
import { apiGetCurrentUser } from "@/core-api/auth.api";

export function useCurrentUserQuery() {
  return useQuery({ queryKey: ["auth", "current-user"] as const, queryFn: apiGetCurrentUser });
}
