import type { RequestHandler } from "express";
import { dtoServiceTokenList } from "../../dto/organization-service-token.dto.js";
import ApiResponse from "../../lib/response.js";
import { getAuthenticatedUserId } from "../../middlewares/auth.middleware.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  listOrganizationProfileServiceTokensForUser,
  registerOrganizationProfileServiceTokenForUser,
  revokeOrganizationProfileServiceTokenForUser
} from "./factory.js";
import { toServiceTokenResponse } from "../organization-service-tokens/utils.js";
import {
  validatorOrganizationProfileServiceTokenIdParams,
  validatorOrganizationProfileServiceTokenParams,
  validatorRegisterServiceTokenBody
} from "./validator.js";

export const controllerListOrganizationProfileServiceTokens: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, profileId } = validatorOrganizationProfileServiceTokenParams.parse(
      req.params
    );
    const tokens = await listOrganizationProfileServiceTokensForUser(
      organizationId,
      profileId,
      getAuthenticatedUserId(req)
    );
    return new ApiResponse(
      dtoServiceTokenList.parse(
        tokens.map((token) => toServiceTokenResponse({ ...token, userId: null }))
      ),
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
    const token = await registerOrganizationProfileServiceTokenForUser(
      organizationId,
      profileId,
      body,
      getAuthenticatedUserId(req)
    );
    return new ApiResponse(
      toServiceTokenResponse({ ...token, userId: null }),
      "Organization profile service token registered",
      201
    );
  }
);

export const controllerRevokeOrganizationProfileServiceToken: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, profileId, tokenId } =
      validatorOrganizationProfileServiceTokenIdParams.parse(req.params);
    await revokeOrganizationProfileServiceTokenForUser(
      organizationId,
      profileId,
      tokenId,
      getAuthenticatedUserId(req)
    );
    return new ApiResponse(null, "Organization profile service token revoked");
  }
);
