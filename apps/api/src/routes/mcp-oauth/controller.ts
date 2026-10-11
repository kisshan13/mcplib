import type { RequestHandler } from "express";
import { ApiError } from "../../lib/error.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  beginPlatformMcpOAuth,
  completePlatformMcpOAuth,
  getMcpOAuthFailureRedirect,
  getMcpOAuthSuccessRedirect,
  McpOAuthError
} from "../../oauth/service.js";
import {
  clearPlatformMcpOAuthState,
  getPlatformMcpOAuthState,
  setPlatformMcpOAuthState
} from "../../oauth/state.js";
import { validatorMcpOAuthCallbackQuery, validatorMcpOAuthParams } from "./validator.js";

function getAuthenticatedUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  return request.user.id;
}

export const controllerStartPlatformMcpOAuth: RequestHandler = requestHandler(async (req, res) => {
  const { id } = validatorMcpOAuthParams.parse(req.params);
  getAuthenticatedUserId(req);

  try {
    const result = await beginPlatformMcpOAuth(id, getAuthenticatedUserId(req));
    setPlatformMcpOAuthState(res, result.state);
    res.redirect(302, result.authorizationUrl);
  } catch (error) {
    if (error instanceof McpOAuthError) {
      throw new ApiError(error.message, error.status);
    }
    throw error;
  }
});

export const controllerCompletePlatformMcpOAuth: RequestHandler = async (req, res, next) => {
  const { id } = validatorMcpOAuthParams.parse(req.params);
  const query = validatorMcpOAuthCallbackQuery.parse(req.query);
  const state = getPlatformMcpOAuthState(req);
  clearPlatformMcpOAuthState(res);

  try {
    if (!state || !query.state || state.state !== query.state || !query.code) {
      throw new McpOAuthError("The OAuth callback is invalid or has expired.", 400);
    }

    if (query.error) {
      throw new McpOAuthError("GitHub authorization was not completed.", 400);
    }

    await completePlatformMcpOAuth({
      request: req,
      mcpId: id,
      userId: getAuthenticatedUserId(req),
      state
    });

    res.redirect(302, getMcpOAuthSuccessRedirect(id));
  } catch (error) {
    if (error instanceof McpOAuthError) {
      res.redirect(302, getMcpOAuthFailureRedirect(id));
      return;
    }

    next(error);
  }
};
