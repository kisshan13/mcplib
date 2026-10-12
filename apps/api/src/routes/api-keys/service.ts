import { OAuthOwnershipType, OrganizationRole, Prisma } from "@packages/prisma";
import prisma from "../../lib/prisma.js";
import { ApiError } from "../../lib/error.js";
import { generateApiKey } from "../../lib/api-key.js";

export const manageableApiKeyWhere = (userId: string): Prisma.ApiKeyWhereInput => ({
  OR: [
    { ownershipType: OAuthOwnershipType.PLATFORM, userId },
    {
      ownershipType: OAuthOwnershipType.ORGANIZATION,
      organization: {
        members: {
          some: { userId, role: { in: [OrganizationRole.OWNER, OrganizationRole.ADMINISTRATOR] } }
        }
      }
    }
  ]
});

export function findManageableApiKey(id: string, userId: string) {
  return prisma.apiKey.findFirst({
    where: { id, ...manageableApiKeyWhere(userId) },
    include: { organization: true, mcpAccess: { orderBy: { createdAt: "asc" } } }
  });
}

export function createApiKey(input: {
  name: string;
  description: string | null;
  ownershipType: OAuthOwnershipType;
  organizationId: string | null;
  userId: string;
  expiresAt: Date | null;
}) {
  const generated = generateApiKey();
  return prisma.apiKey
    .create({
      data: {
        name: input.name,
        description: input.description,
        ownershipType: input.ownershipType,
        organizationId: input.organizationId,
        userId: input.userId,
        prefix: generated.prefix,
        verifier: generated.verifier,
        expiresAt: input.expiresAt
      },
      include: { organization: true }
    })
    .then((record) => ({ record, secret: generated.value }));
}

export async function listApiKeys(input: {
  userId: string;
  type?: "platform" | "organization";
  status?: "active" | "revoked" | "expired";
  search?: string;
  page: number;
  pageSize: number;
}) {
  const now = new Date();
  const statusFilter: Prisma.ApiKeyWhereInput[] = [];
  if (input.status === "active")
    statusFilter.push({ revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] });
  if (input.status === "revoked") statusFilter.push({ revokedAt: { not: null } });
  if (input.status === "expired") statusFilter.push({ expiresAt: { lte: now }, revokedAt: null });
  const where: Prisma.ApiKeyWhereInput = {
    ...manageableApiKeyWhere(input.userId),
    ...(input.type
      ? {
          ownershipType:
            input.type === "platform"
              ? OAuthOwnershipType.PLATFORM
              : OAuthOwnershipType.ORGANIZATION
        }
      : {}),
    ...(input.search ? { name: { contains: input.search, mode: "insensitive" } } : {}),
    ...(statusFilter.length ? { AND: statusFilter } : {})
  };
  const [items, total] = await prisma.$transaction([
    prisma.apiKey.findMany({
      where,
      include: { organization: true, _count: { select: { mcpAccess: true } } },
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize
    }),
    prisma.apiKey.count({ where })
  ]);
  return { items, total, page: input.page, pageSize: input.pageSize };
}

export function revokeApiKey(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
    include: { organization: true, mcpAccess: { orderBy: { createdAt: "asc" } } }
  });
}
export function listApiKeyMcpAccess(apiKeyId: string) {
  return prisma.apiKeyMcpAccess.findMany({ where: { apiKeyId }, orderBy: { createdAt: "asc" } });
}
export async function grantApiKeyMcpAccess(apiKeyId: string, mcpId: string) {
  try {
    return await prisma.apiKeyMcpAccess.create({ data: { apiKeyId, mcpId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      throw new ApiError("This MCP is already authorized for the API key", 409);
    throw error;
  }
}
export async function revokeApiKeyMcpAccess(apiKeyId: string, mcpId: string): Promise<void> {
  const result = await prisma.apiKeyMcpAccess.deleteMany({ where: { apiKeyId, mcpId } });
  if (result.count === 0) throw new ApiError("MCP access assignment not found", 404);
}
