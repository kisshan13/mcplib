import { ApiError } from "../../lib/error.js";
import { requireOrganizationManager } from "../organization-members/service.js";
import { findOrganizationProfile } from "../organization-profiles/service.js";
import {
  listOrganizationProfileServiceTokens,
  registerOrganizationProfileServiceToken,
  revokeOrganizationProfileServiceToken
} from "../organization-service-tokens/service.js";
import { authenticationMethodFromInput } from "../organization-service-tokens/utils.js";
import type { validatorRegisterServiceTokenBody } from "../organization-service-tokens/validator.js";

async function requireManagedProfile(organizationId: string, profileId: string, userId: string) {
  await requireOrganizationManager(organizationId, userId);
  const profile = await findOrganizationProfile(organizationId, profileId);
  if (!profile) throw new ApiError("Organization profile not found", 404);
}

export async function listOrganizationProfileServiceTokensForUser(
  organizationId: string,
  profileId: string,
  userId: string
) {
  await requireManagedProfile(organizationId, profileId, userId);
  return listOrganizationProfileServiceTokens(organizationId, profileId);
}

export async function registerOrganizationProfileServiceTokenForUser(
  organizationId: string,
  profileId: string,
  body: ReturnType<typeof validatorRegisterServiceTokenBody.parse>,
  userId: string
) {
  await requireManagedProfile(organizationId, profileId, userId);
  return registerOrganizationProfileServiceToken({
    organizationId,
    profileId,
    secretId: body.secretId,
    integrationId: body.integrationId,
    serviceProvider: body.serviceProvider ?? body.integrationId,
    authenticationMethod: authenticationMethodFromInput(body.authenticationMethod),
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    credentialReference: body.credentialReference,
    accessTokenExpiresAt: body.accessTokenExpiresAt ? new Date(body.accessTokenExpiresAt) : null,
    refreshTokenExpiresAt: body.refreshTokenExpiresAt ? new Date(body.refreshTokenExpiresAt) : null,
    grantedScopes: body.grantedScopes
  });
}

export async function revokeOrganizationProfileServiceTokenForUser(
  organizationId: string,
  profileId: string,
  tokenId: string,
  userId: string
) {
  await requireManagedProfile(organizationId, profileId, userId);
  const result = await revokeOrganizationProfileServiceToken(organizationId, profileId, tokenId);
  if (result.count === 0) throw new ApiError("Service token not found", 404);
}
