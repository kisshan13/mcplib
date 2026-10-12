import type { RequestHandler } from "express";
import { OrganizationRole } from "@packages/prisma";
import {
  dtoOrganizationMember,
  dtoOrganizationMemberList
} from "../../dto/organization-member.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  validatorOrganizationMemberBody,
  validatorOrganizationMemberOrganizationParams,
  validatorOrganizationMemberParams,
  validatorOrganizationMemberRoleBody
} from "./validator.js";
import {
  createOrganizationMember,
  deleteOrganizationMember,
  findOrganizationMember,
  findUserProfile,
  isDuplicateMembership,
  listOrganizationMembers,
  requireOrganizationManager,
  requireOrganizationMember,
  updateOrganizationMember
} from "./service.js";

function getUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) throw new ApiError("Unauthorized", 401);
  return req.user.id;
}

function toMemberResponse(member: {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; image: string | null };
}) {
  return dtoOrganizationMember.parse({
    ...member,
    role: member.role.toLowerCase(),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString()
  });
}

export const controllerListOrganizationMembers: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationMemberOrganizationParams.parse(req.params);
  await requireOrganizationMember(organizationId, getUserId(req));
  const members = await listOrganizationMembers(organizationId);
  return new ApiResponse(
    dtoOrganizationMemberList.parse(members.map(toMemberResponse)),
    "Organization members retrieved"
  );
});

export const controllerAddOrganizationMember: RequestHandler = requestHandler(async (req) => {
  const { organizationId } = validatorOrganizationMemberOrganizationParams.parse(req.params);
  const body = validatorOrganizationMemberBody.parse(req.body);
  await requireOrganizationManager(organizationId, getUserId(req));
  const user = await findUserProfile({ userId: body.userId, email: body.email });
  if (!user) throw new ApiError("User profile not found", 404);

  try {
    const member = await createOrganizationMember({
      organizationId,
      userId: user.id,
      role: body.role === "administrator" ? OrganizationRole.ADMINISTRATOR : OrganizationRole.MEMBER
    });
    return new ApiResponse(toMemberResponse(member), "Organization member added", 201);
  } catch (error) {
    if (isDuplicateMembership(error))
      throw new ApiError("This user is already an organization member", 409);
    throw error;
  }
});

export const controllerUpdateOrganizationMember: RequestHandler = requestHandler(async (req) => {
  const { organizationId, memberId } = validatorOrganizationMemberParams.parse(req.params);
  const body = validatorOrganizationMemberRoleBody.parse(req.body);
  const actor = await requireOrganizationManager(organizationId, getUserId(req));
  const member = await findOrganizationMember(organizationId, memberId);
  if (!member) throw new ApiError("Organization member not found", 404);
  if (
    member.role === OrganizationRole.OWNER ||
    (body.role === "administrator" && actor.role !== OrganizationRole.OWNER)
  ) {
    throw new ApiError("You do not have permission to change this member's role", 403);
  }
  const updated = await updateOrganizationMember(
    memberId,
    body.role === "administrator" ? OrganizationRole.ADMINISTRATOR : OrganizationRole.MEMBER
  );
  return new ApiResponse(toMemberResponse(updated), "Organization member updated");
});

export const controllerDeleteOrganizationMember: RequestHandler = requestHandler(async (req) => {
  const { organizationId, memberId } = validatorOrganizationMemberParams.parse(req.params);
  const actor = await requireOrganizationManager(organizationId, getUserId(req));
  const member = await findOrganizationMember(organizationId, memberId);
  if (!member) throw new ApiError("Organization member not found", 404);
  if (
    member.role === OrganizationRole.OWNER ||
    (member.role === OrganizationRole.ADMINISTRATOR && actor.role !== OrganizationRole.OWNER)
  ) {
    throw new ApiError("You do not have permission to remove this member", 403);
  }
  await deleteOrganizationMember(memberId);
  return new ApiResponse(null, "Organization member removed");
});
