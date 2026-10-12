import { Prisma } from "@packages/prisma";
import { ApiError } from "../../lib/error.js";
import prisma from "../../lib/prisma.js";

export function listOrganizationProfiles(organizationId: string) {
  return prisma.profile.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" }
  });
}

export function findOrganizationProfile(organizationId: string, profileId: string) {
  return prisma.profile.findFirst({ where: { id: profileId, organizationId } });
}

export async function createOrganizationProfile(input: {
  organizationId: string;
  name: string;
  profilePicUrl?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
  providerId: string;
}) {
  try {
    return await prisma.profile.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        profilePicUrl: input.profilePicUrl,
        email: input.email,
        ...(input.metadata === null
          ? { metadata: Prisma.JsonNull }
          : input.metadata !== undefined
            ? { metadata: input.metadata as Prisma.InputJsonValue }
            : {}),
        providerId: input.providerId
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Organization profile providerId is already registered", 409);
    }
    throw error;
  }
}

export async function updateOrganizationProfile(
  organizationId: string,
  profileId: string,
  data: {
    name?: string;
    profilePicUrl?: string | null;
    email?: string | null;
    metadata?: Record<string, unknown> | null;
    providerId?: string;
  }
) {
  try {
    const { metadata, ...profileFields } = data;
    const updateData = {
      ...profileFields,
      ...(metadata === null
        ? { metadata: Prisma.JsonNull }
        : metadata !== undefined
          ? { metadata: metadata as Prisma.InputJsonValue }
          : {})
    };
    return await prisma.profile.updateMany({
      where: { id: profileId, organizationId },
      data: updateData
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError("Organization profile providerId is already registered", 409);
    }
    throw error;
  }
}

export function deleteOrganizationProfile(organizationId: string, profileId: string) {
  return prisma.profile.deleteMany({ where: { id: profileId, organizationId } });
}
