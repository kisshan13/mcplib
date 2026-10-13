import { OrganizationRole } from "@packages/prisma";
import { ApiError } from "../../lib/error.js";
import {
  createOrganization,
  findOrganization,
  findOrganizationMembership,
  listOrganizations,
  updateOrganization
} from "./service.js";
import type {
  validatorCreateOrganizationBody,
  validatorUpdateOrganizationBody
} from "./validator.js";

export function createOrganizationForUser(
  body: ReturnType<typeof validatorCreateOrganizationBody.parse>,
  userId: string
) {
  return createOrganization({ name: body.name, description: body.description ?? null, userId });
}

export function listOrganizationsForUser(userId: string): Promise<
  Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  return listOrganizations(userId);
}

async function getOrganizationMembershipOrThrow(organizationId: string, userId: string) {
  const membership = await findOrganizationMembership(organizationId, userId);
  if (!membership) throw new ApiError("Organization not found", 404);
  return membership;
}

export async function getOrganizationForUser(organizationId: string, userId: string) {
  await getOrganizationMembershipOrThrow(organizationId, userId);
  const organization = await findOrganization(organizationId);
  if (!organization) throw new ApiError("Organization not found", 404);
  return organization;
}

export async function updateOrganizationForUser(
  organizationId: string,
  body: ReturnType<typeof validatorUpdateOrganizationBody.parse>,
  userId: string
) {
  const membership = await getOrganizationMembershipOrThrow(organizationId, userId);
  if (
    membership.role !== OrganizationRole.OWNER &&
    membership.role !== OrganizationRole.ADMINISTRATOR
  ) {
    throw new ApiError("You do not have permission to manage this organization", 403);
  }
  const data = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "description")
      ? { description: body.description }
      : {})
  };
  return updateOrganization(organizationId, data);
}
