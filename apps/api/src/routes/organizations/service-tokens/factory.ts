import { ApiError } from "../../../lib/error.js";
import { findOrganizationMemberByUserId, requireOrganizationManager } from "../members/service.js";
import { findOrganizationProfile } from "../profiles/service.js";
import {
  listOrganizationServiceTokens,
  registerOrganizationServiceToken,
  revokeOrganizationServiceToken,
  listOrganizationProfileServiceTokens,
  registerOrganizationProfileServiceToken,
  revokeOrganizationProfileServiceToken
} from "./service.js";
import { authenticationMethodFromInput } from "./utils.js";
import type { validatorRegisterServiceTokenBody } from "./validator.js";

async function requireManagedMember(
  organizationId: string,
  targetUserId: string,
  actorUserId: string
) {
  await requireOrganizationManager(organizationId, actorUserId);
  const member = await findOrganizationMemberByUserId(organizationId, targetUserId);
  if (!member) throw new ApiError("Organization member not found", 404);
}

export async function listOrganizationServiceTokensForUser(
  organizationId: string,
  targetUserId: string,
  actorUserId: string
) {
  await requireManagedMember(organizationId, targetUserId, actorUserId);
  return listOrganizationServiceTokens(organizationId, targetUserId);
}

export async function registerOrganizationServiceTokenForUser(
  organizationId: string,
  targetUserId: string,
  body: ReturnType<typeof validatorRegisterServiceTokenBody.parse>,
  actorUserId: string
) {
  await requireManagedMember(organizationId, targetUserId, actorUserId);
  return registerOrganizationServiceToken({
    organizationId,
    userId: targetUserId,
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

export async function revokeOrganizationServiceTokenForUser(
  organizationId: string,
  targetUserId: string,
  tokenId: string,
  actorUserId: string
) {
  await requireManagedMember(organizationId, targetUserId, actorUserId);
  const result = await revokeOrganizationServiceToken(organizationId, targetUserId, tokenId);
  if (result.count === 0) throw new ApiError("Service token not found", 404);
}

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
