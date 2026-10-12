import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrganizationProfile,
  removeOrganizationProfile,
  updateOrganizationProfile
} from "@/core-api/organization-profiles.api";
import type {
  CreateOrganizationProfileInput,
  UpdateOrganizationProfileInput
} from "@/core-api/types/organization-profile";
import { organizationProfileQueryKeys } from "./use-organization-profiles-query";

export function useCreateOrganizationProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      input
    }: {
      organizationId: string;
      input: CreateOrganizationProfileInput;
    }) => createOrganizationProfile(organizationId, input),
    onSuccess: (_profile, { organizationId }) =>
      queryClient.invalidateQueries({
        queryKey: organizationProfileQueryKeys.organization(organizationId)
      })
  });
}

export function useUpdateOrganizationProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      profileId,
      input
    }: {
      organizationId: string;
      profileId: string;
      input: UpdateOrganizationProfileInput;
    }) => updateOrganizationProfile(organizationId, profileId, input),
    onSuccess: (_profile, { organizationId }) =>
      queryClient.invalidateQueries({
        queryKey: organizationProfileQueryKeys.organization(organizationId)
      })
  });
}

export function useRemoveOrganizationProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, profileId }: { organizationId: string; profileId: string }) =>
      removeOrganizationProfile(organizationId, profileId),
    onSuccess: (_result, { organizationId }) =>
      queryClient.invalidateQueries({
        queryKey: organizationProfileQueryKeys.organization(organizationId)
      })
  });
}
