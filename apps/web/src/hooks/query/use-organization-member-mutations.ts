import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMember
} from "@/core-api/organization-members.api";
import type {
  AddOrganizationMemberInput,
  UpdateOrganizationMemberInput
} from "@/core-api/types/organization-member";
import { organizationMemberQueryKeys } from "./use-organization-members-query";

export function useAddOrganizationMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      input
    }: {
      organizationId: string;
      input: AddOrganizationMemberInput;
    }) => addOrganizationMember(organizationId, input),
    onSuccess: (_member, { organizationId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationMemberQueryKeys.organization(organizationId)
      });
    }
  });
}

export function useUpdateOrganizationMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      memberId,
      input
    }: {
      organizationId: string;
      memberId: string;
      input: UpdateOrganizationMemberInput;
    }) => updateOrganizationMember(organizationId, memberId, input),
    onSuccess: (_member, { organizationId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationMemberQueryKeys.organization(organizationId)
      });
    }
  });
}

export function useRemoveOrganizationMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, memberId }: { organizationId: string; memberId: string }) =>
      removeOrganizationMember(organizationId, memberId),
    onSuccess: (_result, { organizationId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationMemberQueryKeys.organization(organizationId)
      });
    }
  });
}
