import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import {
  validatorApiKeyIdParams,
  validatorApiKeyMcpParams,
  validatorCreateApiKeyBody,
  validatorGrantMcpAccessBody,
  validatorListApiKeysQuery
} from "../routes/api-keys/validator.js";

const dtoApiKeyOrganization = z.object({ id: z.string(), name: z.string() }).nullable();

export const dtoApiKeyAccess = z
  .object({
    mcpId: z.string(),
    displayName: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().datetime()
  })
  .meta({ id: "ApiKeyMcpAccess" });

export const dtoApiKey = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.enum(["platform", "organization"]),
    organization: dtoApiKeyOrganization,
    prefix: z.string(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime().nullable(),
    revokedAt: z.string().datetime().nullable(),
    lastUsedAt: z.string().datetime().nullable(),
    mcpAccessCount: z.number().int().nonnegative(),
    mcpAccess: z.array(dtoApiKeyAccess)
  })
  .meta({ id: "ApiKey" });

export const dtoApiKeyCreated = z
  .object({ key: dtoApiKey, secret: z.string() })
  .meta({ id: "ApiKeyCreated" });
export const dtoApiKeyList = z
  .object({
    items: z.array(dtoApiKey),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalPages: z.number().int().nonnegative()
  })
  .meta({ id: "ApiKeyList" });
export const dtoApiKeyAccessList = z.array(dtoApiKeyAccess).meta({ id: "ApiKeyAccessList" });

const dtoEnvelope = <T extends z.ZodType>(schema: T, id: string) =>
  z.object({ data: schema, message: z.string(), success: z.boolean() }).meta({ id });

export const dtoApiKeyEnvelope = dtoEnvelope(dtoApiKey, "ApiKeyEnvelope");
export const dtoApiKeyCreatedEnvelope = dtoEnvelope(dtoApiKeyCreated, "ApiKeyCreatedEnvelope");
export const dtoApiKeyListEnvelope = dtoEnvelope(dtoApiKeyList, "ApiKeyListEnvelope");
export const dtoApiKeyAccessListEnvelope = dtoEnvelope(
  dtoApiKeyAccessList,
  "ApiKeyAccessListEnvelope"
);
export const dtoApiKeyAccessEnvelope = dtoEnvelope(dtoApiKeyAccess, "ApiKeyAccessEnvelope");
export const dtoEmptyEnvelope = dtoEnvelope(z.null(), "EmptyEnvelope");

openApiRegistry.registerPath({
  method: "post",
  path: "/api/v1/api-keys",
  request: { body: { content: { "application/json": { schema: validatorCreateApiKeyBody } } } },
  responses: {
    201: {
      description: "API key created",
      content: { "application/json": { schema: dtoApiKeyCreatedEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/api-keys",
  request: { query: validatorListApiKeysQuery },
  responses: {
    200: {
      description: "Manageable API keys",
      content: { "application/json": { schema: dtoApiKeyListEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/api-keys/{keyId}",
  request: { params: validatorApiKeyIdParams },
  responses: {
    200: {
      description: "API key metadata",
      content: { "application/json": { schema: dtoApiKeyEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "post",
  path: "/api/v1/api-keys/{keyId}/revoke",
  request: { params: validatorApiKeyIdParams },
  responses: {
    200: {
      description: "API key revoked",
      content: { "application/json": { schema: dtoApiKeyEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/api-keys/{keyId}/mcp-access",
  request: { params: validatorApiKeyIdParams },
  responses: {
    200: {
      description: "MCP access assignments",
      content: { "application/json": { schema: dtoApiKeyAccessListEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "post",
  path: "/api/v1/api-keys/{keyId}/mcp-access",
  request: {
    params: validatorApiKeyIdParams,
    body: { content: { "application/json": { schema: validatorGrantMcpAccessBody } } }
  },
  responses: {
    201: {
      description: "MCP access granted",
      content: { "application/json": { schema: dtoApiKeyAccessEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "delete",
  path: "/api/v1/api-keys/{keyId}/mcp-access/{mcpId}",
  request: { params: validatorApiKeyMcpParams },
  responses: {
    200: {
      description: "MCP access revoked",
      content: { "application/json": { schema: dtoEmptyEnvelope } }
    }
  }
});
