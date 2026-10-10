import type { RequestHandler } from "express";
import { OrganizationRole } from "@packages/prisma";
import {
  dtoOrganization,
  dtoOrganizationList,
  type OrganizationResponse
} from "../../dto/organization.dto.js";
import { ApiError } from "../../lib/error.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import {
  validatorCreateOrganizationBody,
  validatorOrganizationParams,
  validatorUpdateOrganizationBody
} from "./validator.js";
import {
  createOrganization,
  findOrganization,
  findOrganizationMembership,
  listOrganizations,
  updateOrganization
} from "./factory.js";

function getAuthenticatedUserId(req: Parameters<RequestHandler>[0]): string {
  if (!req.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  return req.user.id;
}

function toOrganizationResponse(organization: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationResponse {
  return dtoOrganization.parse({
    id: organization.id,
    name: organization.name,
    description: organization.description,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString()
  });
}

async function getOrganizationMembership(organizationId: string, userId: string) {
  const membership = await findOrganizationMembership(organizationId, userId);

  if (!membership) {
    throw new ApiError("Organization not found", 404);
  }

  return membership;
}

function assertCanManageOrganization(role: OrganizationRole): void {
  if (role !== OrganizationRole.OWNER && role !== OrganizationRole.ADMINISTRATOR) {
    throw new ApiError("You do not have permission to manage this organization", 403);
  }
}

export const controllerCreateOrganization: RequestHandler = requestHandler(async (req) => {
  const userId = getAuthenticatedUserId(req);
  const body = validatorCreateOrganizationBody.parse(req.body);

  const organization = await createOrganization({
    name: body.name,
    description: body.description ?? null,
    userId
  });

  return new ApiResponse(toOrganizationResponse(organization), "Organization created", 201);
});

export const controllerListOrganizations: RequestHandler = requestHandler(async (req) => {
  const userId = getAuthenticatedUserId(req);
  const organizations = await listOrganizations(userId);

  return new ApiResponse(
    dtoOrganizationList.parse(organizations.map(toOrganizationResponse)),
    "Organizations retrieved"
  );
});

export const controllerGetOrganization: RequestHandler = requestHandler(async (req) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = validatorOrganizationParams.parse(req.params);

  await getOrganizationMembership(id, userId);

  const organization = await findOrganization(id);
  if (!organization) {
    throw new ApiError("Organization not found", 404);
  }

  return new ApiResponse(toOrganizationResponse(organization), "Organization retrieved");
});

export const controllerUpdateOrganization: RequestHandler = requestHandler(async (req) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = validatorOrganizationParams.parse(req.params);
  const body = validatorUpdateOrganizationBody.parse(req.body);
  const membership = await getOrganizationMembership(id, userId);

  assertCanManageOrganization(membership.role);

  const data = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "description")
      ? { description: body.description }
      : {})
  };

  const organization = await updateOrganization(id, data);

  return new ApiResponse(toOrganizationResponse(organization), "Organization updated");
});
