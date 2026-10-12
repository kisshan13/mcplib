import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerOrganizationServiceToken,
  revokeOrganizationServiceToken
} from "@/core-api/organization-service-tokens.api";
import type { RegisterOrganizationServiceTokenInput } from "@/core-api/types/organization-service-token";
import { organizationServiceTokenQueryKeys } from "./use-organization-service-tokens-query";

export function useRegisterOrganizationServiceTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      input
    }: {
      organizationId: string;
      userId: string;
      input: RegisterOrganizationServiceTokenInput;
    }) => registerOrganizationServiceToken(organizationId, userId, input),
    onSuccess: (_token, { organizationId, userId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationServiceTokenQueryKeys.member(organizationId, userId)
      });
    }
  });
}

export function useRevokeOrganizationServiceTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
      tokenId
    }: {
      organizationId: string;
      userId: string;
      tokenId: string;
    }) => revokeOrganizationServiceToken(organizationId, userId, tokenId),
    onSuccess: (_result, { organizationId, userId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationServiceTokenQueryKeys.member(organizationId, userId)
      });
    }
  });
}
