import type { Request } from "express";
import { OAuthOwnershipType } from "@packages/prisma";
import prisma from "./prisma.js";
import { ApiError } from "./error.js";
import { getPresentedApiKey, parseApiKey, verifyApiKeySecret } from "./api-key.js";

export async function authenticateMcpApiKey(input: {
  request: Request;
  mcpId: string;
  ownershipType: OAuthOwnershipType;
  organizationId?: string;
}): Promise<void> {
  const presented = getPresentedApiKey(input.request);
  const parsed = presented ? parseApiKey(presented) : null;

  if (!parsed) throw new ApiError("Unauthorized", 401);
  const key = await prisma.apiKey.findUnique({
    where: { prefix: parsed.prefix },
    select: {
      id: true,
      userId: true,
      profileId: true,
      ownershipType: true,
      organizationId: true,
      prefix: true,
      verifier: true,
      expiresAt: true,
      revokedAt: true,
      organization: {
        select: { members: { select: { userId: true } } }
      },
      profile: { select: { organizationId: true } },
      mcpAccess: { where: { mcpId: input.mcpId }, select: { id: true } }
    }
  });
  const valid = Boolean(
    key &&
    key.ownershipType === input.ownershipType &&
    (input.ownershipType === OAuthOwnershipType.PLATFORM
      ? key.organizationId === null
      : key.organizationId === input.organizationId &&
        (key.profile?.organizationId === input.organizationId ||
          key.organization?.members.some((member) => member.userId === key.userId))) &&
    key.revokedAt === null &&
    (!key.expiresAt || key.expiresAt.getTime() > Date.now()) &&
    key.mcpAccess.length > 0 &&
    verifyApiKeySecret(parsed.secret, key.verifier)
  );
  if (!valid || !key) throw new ApiError("Unauthorized", 401);
  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  input.request.apiKey = {
    id: key.id,
    userId: key.userId,
    profileId: key.profileId,
    ownershipType: key.ownershipType,
    organizationId: key.organizationId,
    prefix: key.prefix
  };
}
