import type { RequestHandler } from "express";
import { dtoOrganizationProfileList } from "../../../dto/organization-profile.dto.js";
import ApiResponse from "../../../lib/response.js";
import { getAuthenticatedUserId } from "../../../middlewares/auth.middleware.js";
import { requestHandler } from "../../../utils/request-handler.js";
import {
  createOrganizationProfileForUser,
  deleteOrganizationProfileForUser,
  getOrganizationProfileForUser,
  listOrganizationProfilesForUser,
  updateOrganizationProfileForUser
} from "./factory.js";
import { toProfileResponse } from "./utils.js";
import {
  validatorCreateOrganizationProfileBody,
  validatorOrganizationProfileIdParams,
  validatorOrganizationProfileParams,
  validatorUpdateOrganizationProfileBody
} from "./validator.js";

export const controllerListOrganizationProfiles: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationProfileParams.parse(req.params);
  const profiles = await listOrganizationProfilesForUser(
    organizationId,
    getAuthenticatedUserId(req)
  );
  return new ApiResponse(
    dtoOrganizationProfileList.parse(profiles.map(toProfileResponse)),
    "Organization profiles retrieved"
  );
});

export const controllerCreateOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationProfileParams.parse(req.params);
  const body = validatorCreateOrganizationProfileBody.parse(req.body);
  const profile = await createOrganizationProfileForUser(
    organizationId,
    body,
    getAuthenticatedUserId(req)
  );
  return new ApiResponse(toProfileResponse(profile), "Organization profile created", 201);
});

export const controllerGetOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId, profileId } = validatorOrganizationProfileIdParams.parse(req.params);
  const profile = await getOrganizationProfileForUser(
    organizationId,
    profileId,
    getAuthenticatedUserId(req)
  );
  return new ApiResponse(toProfileResponse(profile), "Organization profile retrieved");
});

export const controllerUpdateOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId, profileId } = validatorOrganizationProfileIdParams.parse(req.params);
  const body = validatorUpdateOrganizationProfileBody.parse(req.body);
  const profile = await updateOrganizationProfileForUser(
    organizationId,
    profileId,
    body,
    getAuthenticatedUserId(req)
  );
  return new ApiResponse(toProfileResponse(profile), "Organization profile updated");
});

export const controllerDeleteOrganizationProfile: RequestHandler = requestHandler(async (req) => {
  const { organizationId, profileId } = validatorOrganizationProfileIdParams.parse(req.params);
  await deleteOrganizationProfileForUser(organizationId, profileId, getAuthenticatedUserId(req));
  return new ApiResponse(null, "Organization profile deleted");
});
