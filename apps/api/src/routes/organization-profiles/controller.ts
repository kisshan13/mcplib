import type { RequestHandler } from "express";
import { OrganizationRole } from "@packages/prisma";
import {
  dtoOrganizationProfile,
  dtoOrganizationProfileList
} from "../../dto/organization-profile.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import { findOrganizationMembership } from "../organizations/service.js";
import {
  createOrganizationProfile,
  deleteOrganizationProfile,
  findOrganizationProfile,
  listOrganizationProfiles,
  updateOrganizationProfile
} from "./service.js";
import {
  validatorCreateOrganizationProfileBody,
  validatorOrganizationProfileIdParams,
  validatorOrganizationProfileParams,
  validatorUpdateOrganizationProfileBody
} from "./validator.js";

function getUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) throw new ApiError("Unauthorized", 401);
  return req.user.id;
}

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

function toProfileResponse(profile: {
  id: string;
  organizationId: string;
  name: string;
  profilePicUrl: string | null;
  email: string | null;
  metadata: unknown;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return dtoOrganizationProfile.parse({
    ...profile,
    metadata: profile.metadata as Record<string, unknown> | null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  });
}

export const controllerListOrganizationProfiles: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationProfileParams.parse(req.params);
  await requireOrganizationAccess(organizationId, getUserId(req));
  return new ApiResponse(
    dtoOrganizationProfileList.parse(
      (await listOrganizationProfiles(organizationId)).map(toProfileResponse)
    ),
    "Organization profiles retrieved"
  );
});

export const controllerCreateOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationProfileParams.parse(req.params);
  await requireOrganizationAccess(organizationId, getUserId(req), true);
  const body = validatorCreateOrganizationProfileBody.parse(req.body);
  const profile = await createOrganizationProfile({ organizationId, ...body });
  return new ApiResponse(toProfileResponse(profile), "Organization profile created", 201);
});

export const controllerGetOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId, profileId } = validatorOrganizationProfileIdParams.parse(req.params);
  await requireOrganizationAccess(organizationId, getUserId(req));
  const profile = await findOrganizationProfile(organizationId, profileId);
  if (!profile) throw new ApiError("Organization profile not found", 404);
  return new ApiResponse(toProfileResponse(profile), "Organization profile retrieved");
});

export const controllerUpdateOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId, profileId } = validatorOrganizationProfileIdParams.parse(req.params);
  await requireOrganizationAccess(organizationId, getUserId(req), true);
  const body = validatorUpdateOrganizationProfileBody.parse(req.body);
  const result = await updateOrganizationProfile(organizationId, profileId, body);
  if (result.count === 0) throw new ApiError("Organization profile not found", 404);
  const profile = await findOrganizationProfile(organizationId, profileId);
  if (!profile) throw new ApiError("Organization profile not found", 404);
  return new ApiResponse(toProfileResponse(profile), "Organization profile updated");
});

export const controllerDeleteOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId, profileId } = validatorOrganizationProfileIdParams.parse(req.params);
  await requireOrganizationAccess(organizationId, getUserId(req), true);
  const result = await deleteOrganizationProfile(organizationId, profileId);
  if (result.count === 0) throw new ApiError("Organization profile not found", 404);
  return new ApiResponse(null, "Organization profile deleted");
});
