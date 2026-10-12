import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerOrganizationProfileServiceToken,
  revokeOrganizationProfileServiceToken
} from "@/core-api/organization-profile-service-tokens.api";
import type { RegisterOrganizationServiceTokenInput } from "@/core-api/types/organization-service-token";
import { organizationProfileServiceTokenQueryKeys } from "./use-organization-profile-service-tokens-query";

export function useRegisterOrganizationProfileServiceTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      profileId,
      input
    }: {
      organizationId: string;
      profileId: string;
      input: RegisterOrganizationServiceTokenInput;
    }) => registerOrganizationProfileServiceToken(organizationId, profileId, input),
    onSuccess: (_token, { organizationId, profileId }) =>
      queryClient.invalidateQueries({
        queryKey: organizationProfileServiceTokenQueryKeys.profile(organizationId, profileId)
      })
  });
}

export function useRevokeOrganizationProfileServiceTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      profileId,
      tokenId
    }: {
      organizationId: string;
      profileId: string;
      tokenId: string;
    }) => revokeOrganizationProfileServiceToken(organizationId, profileId, tokenId),
    onSuccess: (_result, { organizationId, profileId }) =>
      queryClient.invalidateQueries({
        queryKey: organizationProfileServiceTokenQueryKeys.profile(organizationId, profileId)
      })
  });
}
