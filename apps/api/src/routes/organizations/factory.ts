import { Router } from "express";
import { OrganizationRole, Prisma } from "@packages/prisma";
import prisma from "../../lib/prisma.js";
import {
  controllerCreateOrganization,
  controllerGetOrganization,
  controllerListOrganizations,
  controllerUpdateOrganization
} from "./controller.js";

export async function createOrganization(input: {
  name: string;
  description: string | null;
  userId: string;
}) {
  return prisma.$transaction(async (transaction) => {
    const organization = await transaction.organization.create({
      data: {
        name: input.name,
        description: input.description
      }
    });

    await transaction.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: input.userId,
        role: OrganizationRole.OWNER
      }
    });

    return organization;
  });
}

export function listOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      members: { some: { userId } }
    },
    orderBy: { createdAt: "asc" }
  });
}

export function findOrganizationMembership(organizationId: string, userId: string) {
  return prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId }
    }
  });
}

export function findOrganization(organizationId: string) {
  return prisma.organization.findUnique({ where: { id: organizationId } });
}

export function updateOrganization(organizationId: string, data: Prisma.OrganizationUpdateInput) {
  return prisma.organization.update({
    where: { id: organizationId },
    data
  });
}

export function factoryOrganizationRouter(): Router {
  const router = Router();

  router.get("/", controllerListOrganizations);
  router.post("/", controllerCreateOrganization);
  router.get("/:id", controllerGetOrganization);
  router.patch("/:id", controllerUpdateOrganization);

  return router;
}
