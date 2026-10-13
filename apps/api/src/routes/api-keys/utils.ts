import { OAuthOwnershipType } from "@packages/prisma";
import { dtoApiKey, dtoApiKeyAccess } from "../../dto/api-key.dto.js";
import { mcpRegistry } from "../../registry/mcp-registry.js";

export function toSafeApiKey(record: {
  id: string;
  name: string;
  description: string | null;
  ownershipType: OAuthOwnershipType;
  organizationId: string | null;
  prefix: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  organization?: { id: string; name: string } | null;
  profile?: { id: string; name: string; providerId: string } | null;
  mcpAccess?: Array<{ mcpId: string; createdAt: Date }>;
  _count?: { mcpAccess: number };
}) {
  return dtoApiKey.parse({
    id: record.id,
    name: record.name,
    description: record.description,
    type: record.ownershipType === OAuthOwnershipType.PLATFORM ? "platform" : "organization",
    organization: record.organization
      ? { id: record.organization.id, name: record.organization.name }
      : null,
    profile: record.profile
      ? { id: record.profile.id, name: record.profile.name, providerId: record.profile.providerId }
      : null,
    prefix: record.prefix,
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.expiresAt?.toISOString() ?? null,
    revokedAt: record.revokedAt?.toISOString() ?? null,
    lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
    mcpAccessCount: record._count?.mcpAccess ?? record.mcpAccess?.length ?? 0,
    mcpAccess: record.mcpAccess?.map(toApiKeyAccess) ?? []
  });
}

function getMcpMetadata(mcpId: string) {
  try {
    const metadata = mcpRegistry.get(mcpId).metadata;
    return { displayName: metadata.displayName, description: metadata.description ?? null };
  } catch {
    return { displayName: mcpId, description: null };
  }
}

export function toApiKeyAccess(access: { mcpId: string; createdAt: Date }) {
  return dtoApiKeyAccess.parse({
    mcpId: access.mcpId,
    createdAt: access.createdAt.toISOString(),
    ...getMcpMetadata(access.mcpId)
  });
}
