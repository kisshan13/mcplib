import type { Request } from "express";
import {
  authorizationCodeGrantRequest,
  calculatePKCECodeChallenge,
  ClientSecretPost,
  generateRandomCodeVerifier,
  generateRandomState,
  processAuthorizationCodeResponse,
  validateAuthResponse,
  type AuthorizationServer,
  type Client
} from "oauth4webapi";
import { z } from "zod";
import {
  AuthenticationMethod,
  OAuthOwnershipType,
  TokenOwnerType,
  TokenStatus
} from "@packages/prisma";
import { env } from "../config/env.js";
import { encryptCredential } from "../lib/credential-encryption.js";
import prisma from "../lib/prisma.js";
import { getRegisteredMcp, resolveMcpConfiguration } from "../lib/registry.js";
import { mcpRegistry } from "../registry/mcp-registry.js";
import type { PlatformMcpOAuthConfiguration, PlatformMcpOAuthState } from "./types.js";

const platformConfigurationSchema = z.object({
  oauth: z.object({
    clientId: z.string().trim().min(1),
    clientSecret: z.string().min(1),
    redirectUri: z.string().url()
  })
});

export class McpOAuthError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
    this.name = "McpOAuthError";
  }
}

function getOAuthMetadata(mcpId: string) {
  const entry = getRegisteredMcp(mcpRegistry, mcpId);
  const configuration = entry.metadata.secretProviderConfiguration;

  if (!configuration?.oauth) {
    throw new McpOAuthError("This MCP does not support OAuth.", 409);
  }

  if (!configuration.oauth.authorizationUrl || !configuration.oauth.tokenUrl) {
    throw new McpOAuthError("This MCP has incomplete OAuth metadata.", 500);
  }

  return { entry, configuration, oauth: configuration.oauth };
}

async function getPlatformOAuthConfiguration(
  mcpId: string
): Promise<PlatformMcpOAuthConfiguration> {
  const { entry } = getOAuthMetadata(mcpId);
  const configuration = await resolveMcpConfiguration(entry, { type: "platform" });
  const parsed = platformConfigurationSchema.safeParse(configuration);

  if (!parsed.success) {
    throw new McpOAuthError("Platform OAuth is not configured for this MCP.", 503);
  }

  return parsed.data;
}

function getAuthorizationServer(
  issuer: string | undefined,
  authorizationUrl: string,
  tokenUrl: string
): AuthorizationServer {
  return {
    issuer: issuer ?? new URL(authorizationUrl).origin,
    authorization_endpoint: authorizationUrl,
    token_endpoint: tokenUrl
  };
}

function getClient(clientId: string): Client {
  return { client_id: clientId };
}

export async function beginPlatformMcpOAuth(
  mcpId: string,
  userId: string
): Promise<{
  authorizationUrl: string;
  state: PlatformMcpOAuthState;
}> {
  const { oauth } = getOAuthMetadata(mcpId);
  const platformConfiguration = await getPlatformOAuthConfiguration(mcpId);
  const state = generateRandomState();
  const codeVerifier = generateRandomCodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const redirectUri = platformConfiguration.oauth.redirectUri;
  const authorizationUrl = new URL(oauth.authorizationUrl!);

  authorizationUrl.searchParams.set("client_id", platformConfiguration.oauth.clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  if (oauth.scopes.length > 0) {
    authorizationUrl.searchParams.set("scope", oauth.scopes.join(" "));
  }

  return {
    authorizationUrl: authorizationUrl.toString(),
    state: {
      state,
      codeVerifier,
      mcpId,
      userId,
      redirectUri,
      createdAt: Date.now()
    }
  };
}

export async function completePlatformMcpOAuth(input: {
  request: Request;
  mcpId: string;
  userId: string;
  state: PlatformMcpOAuthState;
}): Promise<void> {
  if (input.state.mcpId !== input.mcpId) {
    throw new McpOAuthError("The OAuth state does not match the requested MCP.", 400);
  }

  if (input.state.userId !== input.userId) {
    throw new McpOAuthError("The OAuth state does not match the current user.", 403);
  }

  const { entry, configuration, oauth } = getOAuthMetadata(input.mcpId);
  const platformConfiguration = await getPlatformOAuthConfiguration(input.mcpId);
  const authorizationServer = getAuthorizationServer(
    oauth.issuer,
    oauth.authorizationUrl!,
    oauth.tokenUrl!
  );
  const client = getClient(platformConfiguration.oauth.clientId);
  const callbackUrl = new URL(input.request.originalUrl, input.state.redirectUri);
  const callbackParameters = validateAuthResponse(
    authorizationServer,
    client,
    callbackUrl,
    input.state.state
  );
  const tokenResponse = await authorizationCodeGrantRequest(
    authorizationServer,
    client,
    ClientSecretPost(platformConfiguration.oauth.clientSecret),
    callbackParameters,
    input.state.redirectUri,
    input.state.codeVerifier,
    { headers: { Accept: "application/json" } }
  );
  const tokens = await processAuthorizationCodeResponse(
    authorizationServer,
    client,
    tokenResponse,
    {
      // Slack's user-token endpoint uses token_type="user" for an access token
      // that is sent as a bearer token to Slack Web API methods.
      recognizedTokenTypes: { user: () => undefined }
    }
  );

  const existingToken = await prisma.serviceToken.findFirst({
    where: {
      integrationId: input.mcpId,
      secretId: configuration.secretId,
      ownershipType: OAuthOwnershipType.PLATFORM,
      ownerType: TokenOwnerType.PLATFORM_USER,
      userId: input.userId,
      organizationId: null
    }
  });
  const accessTokenEncrypted = encryptCredential(tokens.access_token);
  const refreshTokenEncrypted = tokens.refresh_token
    ? encryptCredential(tokens.refresh_token)
    : existingToken?.refreshTokenEncrypted;
  const accessTokenExpiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : null;
  const grantedScopes = tokens.scope?.split(/\s+/).filter(Boolean) ?? [...oauth.scopes];

  const data = {
    ownershipType: OAuthOwnershipType.PLATFORM,
    ownerType: TokenOwnerType.PLATFORM_USER,
    organizationId: null,
    userId: input.userId,
    externalUserIdentity: null,
    integrationId: input.mcpId,
    serviceProvider: entry.metadata.serviceProvider ?? input.mcpId,
    authenticationMethod: AuthenticationMethod.OAUTH,
    oauthApplicationId: null,
    accessTokenEncrypted,
    refreshTokenEncrypted: refreshTokenEncrypted ?? null,
    accessTokenExpiresAt,
    grantedScopes,
    status: TokenStatus.ACTIVE
  } as const;

  if (existingToken) {
    await prisma.serviceToken.update({ where: { id: existingToken.id }, data });
  } else {
    await prisma.serviceToken.create({ data });
  }
}

export function getMcpOAuthSuccessRedirect(mcpId: string): string {
  const redirect = new URL("/app/settings", env.WEB_APP_URL);
  redirect.searchParams.set("oauth", "connected");
  redirect.searchParams.set("mcp", mcpId);
  return redirect.toString();
}

export function getMcpOAuthFailureRedirect(mcpId: string): string {
  const redirect = new URL("/app/settings", env.WEB_APP_URL);
  redirect.searchParams.set("oauth", "error");
  redirect.searchParams.set("mcp", mcpId);
  return redirect.toString();
}
