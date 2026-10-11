import { openApiRegistry } from "../openapi/registry.js";
import {
  validatorMcpOAuthCallbackQuery,
  validatorMcpOAuthParams
} from "../routes/mcp-oauth/validator.js";

const oauthRedirectResponse = {
  description: "Redirects to the OAuth provider or the web application."
};

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/mcps/{id}/oauth/authorize",
  request: { params: validatorMcpOAuthParams },
  responses: { 302: oauthRedirectResponse }
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/mcps/{id}/oauth/callback",
  request: {
    params: validatorMcpOAuthParams,
    query: validatorMcpOAuthCallbackQuery
  },
  responses: { 302: oauthRedirectResponse }
});
