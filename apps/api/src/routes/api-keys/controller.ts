import type { RequestHandler } from "express";
import { dtoApiKeyAccessList, dtoApiKeyCreated, dtoApiKeyList } from "../../dto/api-key.dto.js";
import ApiResponse from "../../lib/response.js";
import { getAuthenticatedUserId } from "../../middlewares/auth.middleware.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  createApiKeyForUser,
  getApiKeyForUser,
  grantApiKeyAccessForUser,
  listApiKeyAccessForUser,
  listApiKeysForUser,
  revokeApiKeyAccessForUser,
  revokeApiKeyForUser
} from "./factory.js";
import { toApiKeyAccess, toSafeApiKey } from "./utils.js";
import {
  validatorApiKeyIdParams,
  validatorApiKeyMcpParams,
  validatorCreateApiKeyBody,
  validatorGrantMcpAccessBody,
  validatorListApiKeysQuery
} from "./validator.js";

export const controllerCreateApiKey: RequestHandler = requestHandler(async (req) => {
  const body = validatorCreateApiKeyBody.parse(req.body);
  const result = await createApiKeyForUser(body, getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoApiKeyCreated.parse({ key: toSafeApiKey(result.record), secret: result.secret }),
    "API key created. Copy the secret now; it cannot be retrieved later.",
    201
  );
});

export const controllerListApiKeys: RequestHandler = requestHandler(async (req) => {
  const query = validatorListApiKeysQuery.parse(req.query);
  const result = await listApiKeysForUser(query, getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoApiKeyList.parse({
      items: result.items.map(toSafeApiKey),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize)
    }),
    "API keys retrieved"
  );
});

export const controllerGetApiKey: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  const key = await getApiKeyForUser(keyId, getAuthenticatedUserId(req));
  return new ApiResponse(toSafeApiKey(key), "API key retrieved");
});

export const controllerRevokeApiKey: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  const key = await revokeApiKeyForUser(keyId, getAuthenticatedUserId(req));
  return new ApiResponse(toSafeApiKey(key), "API key revoked");
});

export const controllerListApiKeyMcpAccess: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  const access = await listApiKeyAccessForUser(keyId, getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoApiKeyAccessList.parse(access.map(toApiKeyAccess)),
    "API key MCP access retrieved"
  );
});

export const controllerGrantApiKeyMcpAccess: RequestHandler = requestHandler(async (req) => {
  const { keyId } = validatorApiKeyIdParams.parse(req.params);
  const body = validatorGrantMcpAccessBody.parse(req.body);
  const access = await grantApiKeyAccessForUser(keyId, body, getAuthenticatedUserId(req));
  return new ApiResponse(toApiKeyAccess(access), "MCP access granted", 201);
});

export const controllerRevokeApiKeyMcpAccess: RequestHandler = requestHandler(async (req) => {
  const { keyId, mcpId } = validatorApiKeyMcpParams.parse(req.params);
  await revokeApiKeyAccessForUser(keyId, mcpId, getAuthenticatedUserId(req));
  return new ApiResponse(null, "MCP access revoked");
});
