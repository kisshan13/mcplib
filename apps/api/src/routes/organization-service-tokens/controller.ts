import type { RequestHandler } from "express";
import { dtoServiceTokenList } from "../../dto/organization-service-token.dto.js";
import ApiResponse from "../../lib/response.js";
import { getAuthenticatedUserId } from "../../middlewares/auth.middleware.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  listOrganizationServiceTokensForUser,
  registerOrganizationServiceTokenForUser,
  revokeOrganizationServiceTokenForUser
} from "./factory.js";
import { toServiceTokenResponse } from "./utils.js";
import {
  validatorOrganizationServiceTokenIdParams,
  validatorOrganizationServiceTokenParams,
  validatorRegisterServiceTokenBody
} from "./validator.js";

export const controllerListOrganizationServiceTokens: RequestHandler = requestHandler(
  async (req) => {
    const { organizationId, userId } = validatorOrganizationServiceTokenParams.parse(req.params);
    const tokens = await listOrganizationServiceTokensForUser(
      organizationId,
      userId,
      getAuthenticatedUserId(req)
    );
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
    const token = await registerOrganizationServiceTokenForUser(
      organizationId,
      userId,
      body,
      getAuthenticatedUserId(req)
    );
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
    await revokeOrganizationServiceTokenForUser(
      organizationId,
      userId,
      tokenId,
      getAuthenticatedUserId(req)
    );
    return new ApiResponse(null, "Organization service token revoked");
  }
);
