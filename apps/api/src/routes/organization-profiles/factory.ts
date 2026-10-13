import { OrganizationRole } from "@packages/prisma";
import { ApiError } from "../../lib/error.js";
import { findOrganizationMembership } from "../organizations/service.js";
import {
  createOrganizationProfile,
  deleteOrganizationProfile,
  findOrganizationProfile,
  listOrganizationProfiles,
  updateOrganizationProfile
} from "./service.js";
import type {
  validatorCreateOrganizationProfileBody,
  validatorUpdateOrganizationProfileBody
} from "./validator.js";

async function requireOrganizationAccess(organizationId: string, userId: string, manager = false) {
  const membership = await findOrganizationMembership(organizationId, userId);
  if (!membership) throw new ApiError("Organization not found", 404);
  if (
    manager &&
    membership.role !== OrganizationRole.OWNER &&
    membership.role !== OrganizationRole.ADMINISTRATOR
  ) {
    throw new ApiError("You do not have permission to manage organization profiles", 403);
  }
}

export async function listOrganizationProfilesForUser(organizationId: string, userId: string) {
  await requireOrganizationAccess(organizationId, userId);
  return listOrganizationProfiles(organizationId);
}

export async function createOrganizationProfileForUser(
  organizationId: string,
  body: ReturnType<typeof validatorCreateOrganizationProfileBody.parse>,
  userId: string
) {
  await requireOrganizationAccess(organizationId, userId, true);
  return createOrganizationProfile({ organizationId, ...body });
}

export async function getOrganizationProfileForUser(
  organizationId: string,
  profileId: string,
  userId: string
) {
  await requireOrganizationAccess(organizationId, userId);
  const profile = await findOrganizationProfile(organizationId, profileId);
  if (!profile) throw new ApiError("Organization profile not found", 404);
  return profile;
}

export async function updateOrganizationProfileForUser(
  organizationId: string,
  profileId: string,
  body: ReturnType<typeof validatorUpdateOrganizationProfileBody.parse>,
  userId: string
) {
  await requireOrganizationAccess(organizationId, userId, true);
  const result = await updateOrganizationProfile(organizationId, profileId, body);
  if (result.count === 0) throw new ApiError("Organization profile not found", 404);
  const profile = await findOrganizationProfile(organizationId, profileId);
  if (!profile) throw new ApiError("Organization profile not found", 404);
  return profile;
}

export async function deleteOrganizationProfileForUser(
  organizationId: string,
  profileId: string,
  userId: string
) {
  await requireOrganizationAccess(organizationId, userId, true);
  const result = await deleteOrganizationProfile(organizationId, profileId);
  if (result.count === 0) throw new ApiError("Organization profile not found", 404);
}
