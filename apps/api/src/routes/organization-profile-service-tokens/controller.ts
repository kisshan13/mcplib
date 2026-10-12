import type { RequestHandler } from "express";
import { AuthenticationMethod, TokenStatus } from "@packages/prisma";
import { dtoServiceToken, dtoServiceTokenList } from "../../dto/organization-service-token.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import { requireOrganizationManager } from "../organization-members/service.js";
import { findOrganizationProfile } from "../organization-profiles/service.js";
import {
  listOrganizationProfileServiceTokens,
  registerOrganizationProfileServiceToken,
  revokeOrganizationProfileServiceToken
} from "./service.js";
import {
  validatorOrganizationProfileServiceTokenIdParams,
  validatorOrganizationProfileServiceTokenParams,
  validatorRegisterServiceTokenBody
} from "./validator.js";

function getUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) throw new ApiError("Unauthorized", 401);
  return req.user.id;
}

async function requireManagedProfile(
  req: Parameters<RequestHandler>[0],
  organizationId: string,
  profileId: string
) {
  await requireOrganizationManager(organizationId, getUserId(req));
  const profile = await findOrganizationProfile(organizationId, profileId);
  if (!profile) throw new ApiError("Organization profile not found", 404);
}

function parseAuthenticationMethod(
  value: ReturnType<typeof validatorRegisterServiceTokenBody.parse>["authenticationMethod"]
): AuthenticationMethod {
  return {
    oauth: AuthenticationMethod.OAUTH,
    api_key: AuthenticationMethod.API_KEY,
    bearer_token: AuthenticationMethod.BEARER_TOKEN,
    basic_auth: AuthenticationMethod.BASIC_AUTH,
    custom: AuthenticationMethod.CUSTOM
  }[value];
}

function toServiceTokenResponse(token: {
  id: string;
  secretId: string;
  organizationId: string | null;
  profileId: string | null;
  integrationId: string;
  serviceProvider: string;
  authenticationMethod: AuthenticationMethod;
  grantedScopes: string[];
  status: TokenStatus;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return dtoServiceToken.parse({
    ...token,
    userId: null,
    authenticationMethod: token.authenticationMethod.toLowerCase(),
    status: token.status.toLowerCase(),
    accessTokenExpiresAt: token.accessTokenExpiresAt?.toISOString() ?? null,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt?.toISOString() ?? null,
    createdAt: token.createdAt.toISOString(),
    updatedAt: token.updatedAt.toISOString()
  });
}

export const controllerListOrganizationProfileServiceTokens: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, profileId } = validatorOrganizationProfileServiceTokenParams.parse(
      req.params
    );
    await requireManagedProfile(req, organizationId, profileId);
    const tokens = await listOrganizationProfileServiceTokens(organizationId, profileId);
    return new ApiResponse(
      dtoServiceTokenList.parse(tokens.map(toServiceTokenResponse)),
      "Organization profile service tokens retrieved"
    );
  }
);

export const controllerRegisterOrganizationProfileServiceToken: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, profileId } = validatorOrganizationProfileServiceTokenParams.parse(
      req.params
    );
    const body = validatorRegisterServiceTokenBody.parse(req.body);
    await requireManagedProfile(req, organizationId, profileId);
    const token = await registerOrganizationProfileServiceToken({
      organizationId,
      profileId,
      secretId: body.secretId,
      integrationId: body.integrationId,
      serviceProvider: body.serviceProvider ?? body.integrationId,
      authenticationMethod: parseAuthenticationMethod(body.authenticationMethod),
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      credentialReference: body.credentialReference,
      accessTokenExpiresAt: body.accessTokenExpiresAt ? new Date(body.accessTokenExpiresAt) : null,
      refreshTokenExpiresAt: body.refreshTokenExpiresAt
        ? new Date(body.refreshTokenExpiresAt)
        : null,
      grantedScopes: body.grantedScopes
    });
    return new ApiResponse(
      toServiceTokenResponse(token),
      "Organization profile service token registered",
      201
    );
  }
);

export const controllerRevokeOrganizationProfileServiceToken: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, profileId, tokenId } =
      validatorOrganizationProfileServiceTokenIdParams.parse(req.params);
    await requireManagedProfile(req, organizationId, profileId);
    const result = await revokeOrganizationProfileServiceToken(organizationId, profileId, tokenId);
    if (result.count === 0) throw new ApiError("Service token not found", 404);
    return new ApiResponse(null, "Organization profile service token revoked");
  }
);
