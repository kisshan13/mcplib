import type { RequestHandler } from "express";
import { dtoOrganizationMemberList } from "../../dto/organization-member.dto.js";
import ApiResponse from "../../lib/response.js";
import { getAuthenticatedUserId } from "../../middlewares/auth.middleware.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  addOrganizationMemberForUser,
  deleteOrganizationMemberForUser,
  listOrganizationMembersForUser,
  updateOrganizationMemberForUser
} from "./factory.js";
import { toMemberResponse } from "./utils.js";
import {
  validatorOrganizationMemberBody,
  validatorOrganizationMemberOrganizationParams,
  validatorOrganizationMemberParams,
  validatorOrganizationMemberRoleBody
} from "./validator.js";

export const controllerListOrganizationMembers: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationMemberOrganizationParams.parse(req.params);
  const members = await listOrganizationMembersForUser(organizationId, getAuthenticatedUserId(req));
  return new ApiResponse(
    dtoOrganizationMemberList.parse(members.map(toMemberResponse)),
    "Organization members retrieved"
  );
});

export const controllerAddOrganizationMember: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationMemberOrganizationParams.parse(req.params);
  const body = validatorOrganizationMemberBody.parse(req.body);
  const member = await addOrganizationMemberForUser(
    organizationId,
    body,
    getAuthenticatedUserId(req)
  );
  return new ApiResponse(toMemberResponse(member), "Organization member added", 201);
});

export const controllerUpdateOrganizationMember: RequestHandler = requestHandler(async (req) => {
  const { organizationId, memberId } = validatorOrganizationMemberParams.parse(req.params);
  const body = validatorOrganizationMemberRoleBody.parse(req.body);
  const member = await updateOrganizationMemberForUser(
    organizationId,
    memberId,
    body.role,
    getAuthenticatedUserId(req)
  );
  return new ApiResponse(toMemberResponse(member), "Organization member updated");
});

export const controllerDeleteOrganizationMember: RequestHandler = requestHandler(async (req) => {
  const { organizationId, memberId } = validatorOrganizationMemberParams.parse(req.params);
  await deleteOrganizationMemberForUser(organizationId, memberId, getAuthenticatedUserId(req));
  return new ApiResponse(null, "Organization member removed");
});
