import type { RequestHandler } from "express";
import { dtoOrganizationList } from "../../dto/organization.dto.js";
import ApiResponse from "../../lib/response.js";
import { getAuthenticatedUserId } from "../../middlewares/auth.middleware.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  createOrganizationForUser,
  getOrganizationForUser,
  listOrganizationsForUser,
  updateOrganizationForUser
} from "./factory.js";
import { toOrganizationResponse } from "./utils.js";
import {
  validatorCreateOrganizationBody,
  validatorOrganizationParams,
  validatorUpdateOrganizationBody
} from "./validator.js";

export const controllerCreateOrganization: RequestHandler = requestHandler(async (req) => {
  const body = validatorCreateOrganizationBody.parse(req.body);
  const organization = await createOrganizationForUser(body, getAuthenticatedUserId(req));
  return new ApiResponse(toOrganizationResponse(organization), "Organization created", 201);
});

export const controllerListOrganizations: RequestHandler = requestHandler(async (req) => {
  const organizations = await listOrganizationsForUser(getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoOrganizationList.parse(organizations.map(toOrganizationResponse)),
    "Organizations retrieved"
  );
});

export const controllerGetOrganization: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorOrganizationParams.parse(req.params);
  const organization = await getOrganizationForUser(id, getAuthenticatedUserId(req));
  return new ApiResponse(toOrganizationResponse(organization), "Organization retrieved");
});

export const controllerUpdateOrganization: RequestHandler = requestHandler(async (req) => {
  const { id } = validatorOrganizationParams.parse(req.params);
  const body = validatorUpdateOrganizationBody.parse(req.body);
  const organization = await updateOrganizationForUser(id, body, getAuthenticatedUserId(req));
  return new ApiResponse(toOrganizationResponse(organization), "Organization updated");
});
