import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization, updateOrganization } from "@/core-api/organization.api";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput
} from "@/core-api/types/organization";
import { organizationQueryKeys } from "./use-organizations-query";

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all })
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      updateOrganization(id, input),
    onSuccess: (organization) => {
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.detail(organization.id)
      });
    }
  });
}
