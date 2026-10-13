import { OrganizationRole, Prisma } from "@packages/prisma";
import { ApiError } from "../../../lib/error.js";
import prisma from "../../../lib/prisma.js";
import { findOrganizationMembership } from "../service.js";

export async function requireOrganizationMember(organizationId: string, userId: string) {
  const membership = await findOrganizationMembership(organizationId, userId);
  if (!membership) throw new ApiError("Organization not found", 404);
  return membership;
}

export async function requireOrganizationManager(organizationId: string, userId: string) {
  const membership = await requireOrganizationMember(organizationId, userId);
  if (
    membership.role !== OrganizationRole.OWNER &&
    membership.role !== OrganizationRole.ADMINISTRATOR
  ) {
    throw new ApiError("You do not have permission to manage this organization", 403);
  }
  return membership;
}

export function listOrganizationMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });
}

export function findOrganizationMember(organizationId: string, memberId: string) {
  return prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId },
    include: { user: true }
  });
}

export function findOrganizationMemberByUserId(organizationId: string, userId: string) {
  return prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    include: { user: true }
  });
}

export function findUserProfile(input: { userId?: string; email?: string }) {
  return prisma.user.findFirst({
    where: input.userId ? { id: input.userId } : { email: input.email }
  });
}

export function createOrganizationMember(input: {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
}) {
  return prisma.organizationMember.create({ data: input, include: { user: true } });
}

export function updateOrganizationMember(memberId: string, role: OrganizationRole) {
  return prisma.organizationMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: true }
  });
}

export function deleteOrganizationMember(memberId: string) {
  return prisma.organizationMember.delete({ where: { id: memberId } });
}

export function isDuplicateMembership(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
