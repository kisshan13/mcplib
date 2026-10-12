import { AuthenticationMethod, Prisma, TokenOwnerType, TokenStatus } from "@packages/prisma";
import { encryptCredential } from "../../lib/credential-encryption.js";
import prisma from "../../lib/prisma.js";

export function listOrganizationServiceTokens(organizationId: string, userId: string) {
  return prisma.serviceToken.findMany({
    where: {
      organizationId,
      userId,
      ownershipType: "ORGANIZATION",
      ownerType: TokenOwnerType.ORGANIZATION_USER
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function registerOrganizationServiceToken(input: {
  organizationId: string;
  userId: string;
  secretId: string;
  integrationId: string;
  serviceProvider: string;
  authenticationMethod: AuthenticationMethod;
  accessToken?: string;
  refreshToken?: string;
  credentialReference?: string;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  grantedScopes: string[];
}) {
  const where: Prisma.ServiceTokenWhereInput = {
    organizationId: input.organizationId,
    userId: input.userId,
    secretId: input.secretId,
    integrationId: input.integrationId,
    ownershipType: "ORGANIZATION",
    ownerType: TokenOwnerType.ORGANIZATION_USER
  };
  const existing = await prisma.serviceToken.findFirst({ where });
  const data = {
    organizationId: input.organizationId,
    userId: input.userId,
    externalUserIdentity: null,
    secretId: input.secretId,
    ownershipType: "ORGANIZATION" as const,
    ownerType: TokenOwnerType.ORGANIZATION_USER,
    integrationId: input.integrationId,
    serviceProvider: input.serviceProvider,
    authenticationMethod: input.authenticationMethod,
    oauthApplicationId: null,
    accessTokenEncrypted: input.accessToken ? encryptCredential(input.accessToken) : null,
    refreshTokenEncrypted: input.refreshToken ? encryptCredential(input.refreshToken) : null,
    credentialReference: input.credentialReference ?? null,
    accessTokenExpiresAt: input.accessTokenExpiresAt,
    refreshTokenExpiresAt: input.refreshTokenExpiresAt,
    grantedScopes: input.grantedScopes,
    status: TokenStatus.ACTIVE
  } as const;
  return existing
    ? prisma.serviceToken.update({ where: { id: existing.id }, data })
    : prisma.serviceToken.create({ data });
}

export function revokeOrganizationServiceToken(
  organizationId: string,
  userId: string,
  tokenId: string
) {
  return prisma.serviceToken.updateMany({
    where: {
      id: tokenId,
      organizationId,
      userId,
      ownershipType: "ORGANIZATION",
      ownerType: TokenOwnerType.ORGANIZATION_USER
    },
    data: { status: TokenStatus.REVOKED, accessTokenEncrypted: null, refreshTokenEncrypted: null }
  });
}

export function listOrganizationProfileServiceTokens(organizationId: string, profileId: string) {
  return prisma.serviceToken.findMany({
    where: {
      organizationId,
      profileId,
      ownershipType: "ORGANIZATION",
      ownerType: TokenOwnerType.ORGANIZATION_PROFILE
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function registerOrganizationProfileServiceToken(input: {
  organizationId: string;
  profileId: string;
  secretId: string;
  integrationId: string;
  serviceProvider: string;
  authenticationMethod: AuthenticationMethod;
  accessToken?: string;
  refreshToken?: string;
  credentialReference?: string;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  grantedScopes: string[];
}) {
  const where: Prisma.ServiceTokenWhereInput = {
    organizationId: input.organizationId,
    profileId: input.profileId,
    secretId: input.secretId,
    integrationId: input.integrationId,
    ownershipType: "ORGANIZATION",
    ownerType: TokenOwnerType.ORGANIZATION_PROFILE
  };
  const existing = await prisma.serviceToken.findFirst({ where });
  const data = {
    organizationId: input.organizationId,
    userId: null,
    profileId: input.profileId,
    externalUserIdentity: null,
    secretId: input.secretId,
    ownershipType: "ORGANIZATION" as const,
    ownerType: TokenOwnerType.ORGANIZATION_PROFILE,
    integrationId: input.integrationId,
    serviceProvider: input.serviceProvider,
    authenticationMethod: input.authenticationMethod,
    oauthApplicationId: null,
    accessTokenEncrypted: input.accessToken ? encryptCredential(input.accessToken) : null,
    refreshTokenEncrypted: input.refreshToken ? encryptCredential(input.refreshToken) : null,
    credentialReference: input.credentialReference ?? null,
    accessTokenExpiresAt: input.accessTokenExpiresAt,
    refreshTokenExpiresAt: input.refreshTokenExpiresAt,
    grantedScopes: input.grantedScopes,
    status: TokenStatus.ACTIVE
  } as const;
  return existing
    ? prisma.serviceToken.update({ where: { id: existing.id }, data })
    : prisma.serviceToken.create({ data });
}

export function revokeOrganizationProfileServiceToken(
  organizationId: string,
  profileId: string,
  tokenId: string
) {
  return prisma.serviceToken.updateMany({
    where: {
      id: tokenId,
      organizationId,
      profileId,
      ownershipType: "ORGANIZATION",
      ownerType: TokenOwnerType.ORGANIZATION_PROFILE
    },
    data: { status: TokenStatus.REVOKED, accessTokenEncrypted: null, refreshTokenEncrypted: null }
  });
}
