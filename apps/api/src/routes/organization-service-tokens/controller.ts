import type { RequestHandler } from "express";
import { AuthenticationMethod, TokenStatus } from "@packages/prisma";
import { dtoServiceToken, dtoServiceTokenList } from "../../dto/organization-service-token.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  findOrganizationMemberByUserId,
  requireOrganizationManager
} from "../organization-members/service.js";
import {
  validatorOrganizationServiceTokenIdParams,
  validatorOrganizationServiceTokenParams,
  validatorRegisterServiceTokenBody
} from "./validator.js";
import {
  listOrganizationServiceTokens,
  registerOrganizationServiceToken,
  revokeOrganizationServiceToken
} from "./service.js";

function getUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) throw new ApiError("Unauthorized", 401);
  return req.user.id;
}

async function requireManagedMember(
  req: Parameters<RequestHandler>[0],
  organizationId: string,
  userId: string
) {
  await requireOrganizationManager(organizationId, getUserId(req));
  const member = await findOrganizationMemberByUserId(organizationId, userId);
  if (!member) throw new ApiError("Organization member not found", 404);
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
  userId: string | null;
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
    authenticationMethod: token.authenticationMethod.toLowerCase(),
    status: token.status.toLowerCase(),
    accessTokenExpiresAt: token.accessTokenExpiresAt?.toISOString() ?? null,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt?.toISOString() ?? null,
    createdAt: token.createdAt.toISOString(),
    updatedAt: token.updatedAt.toISOString()
  });
}

export const controllerListOrganizationServiceTokens: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, userId } = validatorOrganizationServiceTokenParams.parse(req.params);
    await requireManagedMember(req, organizationId, userId);
    const tokens = await listOrganizationServiceTokens(organizationId, userId);
    return new ApiResponse(
      dtoServiceTokenList.parse(tokens.map(toServiceTokenResponse)),
      "Organization service tokens retrieved"
    );
  }
);

export const controllerRegisterOrganizationServiceToken: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, userId } = validatorOrganizationServiceTokenParams.parse(req.params);
    const body = validatorRegisterServiceTokenBody.parse(req.body);
    await requireManagedMember(req, organizationId, userId);
    const token = await registerOrganizationServiceToken({
      organizationId,
      userId,
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
      "Organization service token registered",
      201
    );
  }
);

export const controllerRevokeOrganizationServiceToken: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, userId, tokenId } = validatorOrganizationServiceTokenIdParams.parse(
      req.params
    );
    await requireManagedMember(req, organizationId, userId);
    const result = await revokeOrganizationServiceToken(organizationId, userId, tokenId);
    if (result.count === 0) throw new ApiError("Service token not found", 404);
    return new ApiResponse(null, "Organization service token revoked");
  }
);
