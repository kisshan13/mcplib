import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWrappedMutation } from "@/query-provider";
import {
  apiCreateOrganization,
  apiCreateOrganizationMember,
  apiCreateOrganizationProfile,
  apiCreateOrganizationProfileServiceToken,
  apiCreateOrganizationServiceToken,
  apiDeleteOrganizationMember,
  apiDeleteOrganizationProfile,
  apiDeleteOrganizationProfileServiceToken,
  apiDeleteOrganizationServiceToken,
  apiGetOrganization,
  apiGetOrganizationMembers,
  apiGetOrganizationProfileServiceTokens,
  apiGetOrganizationProfiles,
  apiGetOrganizationProfile,
  apiGetOrganizationServiceTokens,
  apiGetOrganizations,
  apiUpdateOrganization,
  apiUpdateOrganizationMember,
  apiUpdateOrganizationProfile
} from "@/core-api/organization.api";
import type {
  AddOrganizationMemberInput,
  CreateOrganizationInput,
  CreateOrganizationProfileInput,
  RegisterOrganizationServiceTokenInput,
  UpdateOrganizationInput,
  UpdateOrganizationMemberInput,
  UpdateOrganizationProfileInput
} from "@/core-api/types/organization";

export const organizationQueryKeys = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const,
  members: (organizationId: string) => ["organization-members", organizationId] as const,
  profiles: (organizationId: string) => ["organization-profiles", organizationId] as const,
  serviceTokens: (organizationId: string, userId: string) =>
    ["organization-service-tokens", organizationId, userId] as const,
  profileServiceTokens: (organizationId: string, profileId: string) =>
    ["organization-profile-service-tokens", organizationId, profileId] as const
};

export function useOrganizationsQuery() {
  return useQuery({ queryKey: organizationQueryKeys.all, queryFn: apiGetOrganizations });
}

export function useOrganizationQuery(id: string) {
  return useQuery({
    queryKey: organizationQueryKeys.detail(id),
    queryFn: () => apiGetOrganization(id),
    enabled: Boolean(id)
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<CreateOrganizationInput>(
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all }) },
    (input: CreateOrganizationInput) => apiCreateOrganization(input)
  );
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ id: string; input: UpdateOrganizationInput }>(
    {
      onSuccess: (organization) => {
        const updatedOrganization = organization as { id: string };
        void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
        void queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.detail(updatedOrganization.id)
        });
      }
    },
    ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      apiUpdateOrganization(id, input)
  );
}

export function useOrganizationMembersQuery(organizationId: string) {
  return useQuery({
    queryKey: organizationQueryKeys.members(organizationId),
    queryFn: () => apiGetOrganizationMembers(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useAddOrganizationMemberMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ organizationId: string; input: AddOrganizationMemberInput }>(
    {
      onSuccess: (_member, { organizationId }: { organizationId: string }) =>
        queryClient.invalidateQueries({ queryKey: organizationQueryKeys.members(organizationId) })
    },
    ({ organizationId, input }: { organizationId: string; input: AddOrganizationMemberInput }) =>
      apiCreateOrganizationMember(organizationId, input)
  );
}

export function useUpdateOrganizationMemberMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{
    organizationId: string;
    memberId: string;
    input: UpdateOrganizationMemberInput;
  }>(
    {
      onSuccess: (_member, { organizationId }: { organizationId: string }) =>
        queryClient.invalidateQueries({ queryKey: organizationQueryKeys.members(organizationId) })
    },
    ({
      organizationId,
      memberId,
      input
    }: {
      organizationId: string;
      memberId: string;
      input: UpdateOrganizationMemberInput;
    }) => apiUpdateOrganizationMember(organizationId, memberId, input)
  );
}

export function useRemoveOrganizationMemberMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ organizationId: string; memberId: string }>(
    {
      onSuccess: (_result, { organizationId }: { organizationId: string }) =>
        queryClient.invalidateQueries({ queryKey: organizationQueryKeys.members(organizationId) })
    },
    ({ organizationId, memberId }: { organizationId: string; memberId: string }) =>
      apiDeleteOrganizationMember(organizationId, memberId)
  );
}

export function useOrganizationProfilesQuery(organizationId: string) {
  return useQuery({
    queryKey: organizationQueryKeys.profiles(organizationId),
    queryFn: () => apiGetOrganizationProfiles(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useOrganizationProfileQuery(organizationId: string, profileId: string) {
  return useQuery({
    queryKey: [...organizationQueryKeys.profiles(organizationId), profileId] as const,
    queryFn: () => apiGetOrganizationProfile(organizationId, profileId),
    enabled: Boolean(organizationId && profileId)
  });
}

export function useCreateOrganizationProfileMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ organizationId: string; input: CreateOrganizationProfileInput }>(
    {
      onSuccess: (_profile, { organizationId }: { organizationId: string }) =>
        queryClient.invalidateQueries({ queryKey: organizationQueryKeys.profiles(organizationId) })
    },
    ({
      organizationId,
      input
    }: {
      organizationId: string;
      input: CreateOrganizationProfileInput;
    }) => apiCreateOrganizationProfile(organizationId, input)
  );
}

export function useUpdateOrganizationProfileMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{
    organizationId: string;
    profileId: string;
    input: UpdateOrganizationProfileInput;
  }>(
    {
      onSuccess: (_profile, { organizationId }: { organizationId: string }) =>
        queryClient.invalidateQueries({ queryKey: organizationQueryKeys.profiles(organizationId) })
    },
    ({
      organizationId,
      profileId,
      input
    }: {
      organizationId: string;
      profileId: string;
      input: UpdateOrganizationProfileInput;
    }) => apiUpdateOrganizationProfile(organizationId, profileId, input)
  );
}

export function useRemoveOrganizationProfileMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ organizationId: string; profileId: string }>(
    {
      onSuccess: (_result, { organizationId }: { organizationId: string }) =>
        queryClient.invalidateQueries({ queryKey: organizationQueryKeys.profiles(organizationId) })
    },
    ({ organizationId, profileId }: { organizationId: string; profileId: string }) =>
      apiDeleteOrganizationProfile(organizationId, profileId)
  );
}

export function useOrganizationServiceTokensQuery(organizationId: string, userId: string) {
  return useQuery({
    queryKey: organizationQueryKeys.serviceTokens(organizationId, userId),
    queryFn: () => apiGetOrganizationServiceTokens(organizationId, userId),
    enabled: Boolean(organizationId && userId)
  });
}

export function useRegisterOrganizationServiceTokenMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{
    organizationId: string;
    userId: string;
    input: RegisterOrganizationServiceTokenInput;
  }>(
    {
      onSuccess: (_token, { organizationId, userId }: { organizationId: string; userId: string }) =>
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.serviceTokens(organizationId, userId)
        })
    },
    ({
      organizationId,
      userId,
      input
    }: {
      organizationId: string;
      userId: string;
      input: RegisterOrganizationServiceTokenInput;
    }) => apiCreateOrganizationServiceToken(organizationId, userId, input)
  );
}

export function useRevokeOrganizationServiceTokenMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ organizationId: string; userId: string; tokenId: string }>(
    {
      onSuccess: (
        _result,
        { organizationId, userId }: { organizationId: string; userId: string }
      ) =>
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.serviceTokens(organizationId, userId)
        })
    },
    ({
      organizationId,
      userId,
      tokenId
    }: {
      organizationId: string;
      userId: string;
      tokenId: string;
    }) => apiDeleteOrganizationServiceToken(organizationId, userId, tokenId)
  );
}

export function useOrganizationProfileServiceTokensQuery(
  organizationId: string,
  profileId: string
) {
  return useQuery({
    queryKey: organizationQueryKeys.profileServiceTokens(organizationId, profileId),
    queryFn: () => apiGetOrganizationProfileServiceTokens(organizationId, profileId),
    enabled: Boolean(organizationId && profileId)
  });
}

export function useRegisterOrganizationProfileServiceTokenMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{
    organizationId: string;
    profileId: string;
    input: RegisterOrganizationServiceTokenInput;
  }>(
    {
      onSuccess: (
        _token,
        { organizationId, profileId }: { organizationId: string; profileId: string }
      ) =>
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.profileServiceTokens(organizationId, profileId)
        })
    },
    ({
      organizationId,
      profileId,
      input
    }: {
      organizationId: string;
      profileId: string;
      input: RegisterOrganizationServiceTokenInput;
    }) => apiCreateOrganizationProfileServiceToken(organizationId, profileId, input)
  );
}

export function useRevokeOrganizationProfileServiceTokenMutation() {
  const queryClient = useQueryClient();
  return useWrappedMutation<{ organizationId: string; profileId: string; tokenId: string }>(
    {
      onSuccess: (
        _result,
        { organizationId, profileId }: { organizationId: string; profileId: string }
      ) =>
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.profileServiceTokens(organizationId, profileId)
        })
    },
    ({
      organizationId,
      profileId,
      tokenId
    }: {
      organizationId: string;
      profileId: string;
      tokenId: string;
    }) => apiDeleteOrganizationProfileServiceToken(organizationId, profileId, tokenId)
  );
}
