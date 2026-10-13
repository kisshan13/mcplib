import { AuthenticationMethod, TokenStatus } from "@packages/prisma";
import { dtoServiceToken } from "../../dto/organization-service-token.dto.js";

export function authenticationMethodFromInput(
  value: "oauth" | "api_key" | "bearer_token" | "basic_auth" | "custom"
) {
  return {
    oauth: AuthenticationMethod.OAUTH,
    api_key: AuthenticationMethod.API_KEY,
    bearer_token: AuthenticationMethod.BEARER_TOKEN,
    basic_auth: AuthenticationMethod.BASIC_AUTH,
    custom: AuthenticationMethod.CUSTOM
  }[value];
}

export function toServiceTokenResponse(token: {
  id: string;
  secretId: string;
  organizationId: string | null;
  userId?: string | null;
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
    userId: token.userId ?? null,
    authenticationMethod: token.authenticationMethod.toLowerCase(),
    status: token.status.toLowerCase(),
    accessTokenExpiresAt: token.accessTokenExpiresAt?.toISOString() ?? null,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt?.toISOString() ?? null,
    createdAt: token.createdAt.toISOString(),
    updatedAt: token.updatedAt.toISOString()
  });
}
