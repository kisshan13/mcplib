import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import {
  validatorOrganizationServiceTokenIdParams,
  validatorOrganizationServiceTokenParams,
  validatorRegisterServiceTokenBody
} from "../routes/organizations/service-tokens/validator.js";
import {
  validatorOrganizationProfileServiceTokenIdParams,
  validatorOrganizationProfileServiceTokenParams
} from "../routes/organizations/service-tokens/validator.js";

export const dtoServiceToken = z
  .object({
    id: z.string(),
    secretId: z.string(),
    organizationId: z.string().nullable(),
    userId: z.string().nullable(),
    profileId: z.string().nullable(),
    integrationId: z.string(),
    serviceProvider: z.string(),
    authenticationMethod: z.enum(["oauth", "api_key", "bearer_token", "basic_auth", "custom"]),
    grantedScopes: z.array(z.string()),
    status: z.enum(["active", "expired", "revoked", "invalid"]),
    accessTokenExpiresAt: z.string().datetime().nullable(),
    refreshTokenExpiresAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })
  .meta({ id: "ServiceToken" });

export const dtoServiceTokenList = z.array(dtoServiceToken).meta({ id: "ServiceTokenList" });
export const dtoServiceTokenEnvelope = z
  .object({ data: dtoServiceToken, message: z.string(), success: z.boolean() })
  .meta({ id: "ServiceTokenEnvelope" });
export const dtoServiceTokenListEnvelope = z
  .object({ data: dtoServiceTokenList, message: z.string(), success: z.boolean() })
  .meta({ id: "ServiceTokenListEnvelope" });

const serviceTokenPath = "/api/v1/organizations/{organizationId}/members/{userId}/service-tokens";

openApiRegistry.registerPath({
  method: "get",
  path: serviceTokenPath,
  request: { params: validatorOrganizationServiceTokenParams },
  responses: {
    200: {
      description: "Organization service tokens",
      content: { "application/json": { schema: dtoServiceTokenListEnvelope } }
    }
  }
});

const profileServiceTokenPath =
  "/api/v1/organizations/{organizationId}/profiles/{profileId}/service-tokens";

openApiRegistry.registerPath({
  method: "get",
  path: profileServiceTokenPath,
  request: { params: validatorOrganizationProfileServiceTokenParams },
  responses: {
    200: {
      description: "Organization profile service tokens",
      content: { "application/json": { schema: dtoServiceTokenListEnvelope } }
    }
  }
});

openApiRegistry.registerPath({
  method: "post",
  path: profileServiceTokenPath,
  request: {
    params: validatorOrganizationProfileServiceTokenParams,
    body: { content: { "application/json": { schema: validatorRegisterServiceTokenBody } } }
  },
  responses: {
    201: {
      description: "Organization profile service token registered",
      content: { "application/json": { schema: dtoServiceTokenEnvelope } }
    }
  }
});

openApiRegistry.registerPath({
  method: "delete",
  path: `${profileServiceTokenPath}/{tokenId}`,
  request: { params: validatorOrganizationProfileServiceTokenIdParams },
  responses: { 200: { description: "Organization profile service token revoked" } }
});

openApiRegistry.registerPath({
  method: "post",
  path: serviceTokenPath,
  request: {
    params: validatorOrganizationServiceTokenParams,
    body: { content: { "application/json": { schema: validatorRegisterServiceTokenBody } } }
  },
  responses: {
    201: {
      description: "Organization service token registered",
      content: { "application/json": { schema: dtoServiceTokenEnvelope } }
    }
  }
});

openApiRegistry.registerPath({
  method: "delete",
  path: `${serviceTokenPath}/{tokenId}`,
  request: { params: validatorOrganizationServiceTokenIdParams },
  responses: { 200: { description: "Organization service token revoked" } }
});
