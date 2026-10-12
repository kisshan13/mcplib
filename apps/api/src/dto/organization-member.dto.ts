import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import {
  validatorOrganizationMemberBody,
  validatorOrganizationMemberOrganizationParams,
  validatorOrganizationMemberParams,
  validatorOrganizationMemberRoleBody
} from "../routes/organization-members/validator.js";

export const dtoOrganizationMember = z
  .object({
    id: z.string(),
    organizationId: z.string(),
    userId: z.string(),
    role: z.enum(["owner", "administrator", "member"]),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      image: z.string().nullable()
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })
  .meta({ id: "OrganizationMember" });

export const dtoOrganizationMemberList = z
  .array(dtoOrganizationMember)
  .meta({ id: "OrganizationMemberList" });

export const dtoOrganizationMemberEnvelope = z
  .object({ data: dtoOrganizationMember, message: z.string(), success: z.boolean() })
  .meta({ id: "OrganizationMemberEnvelope" });

export const dtoOrganizationMemberListEnvelope = z
  .object({ data: dtoOrganizationMemberList, message: z.string(), success: z.boolean() })
  .meta({ id: "OrganizationMemberListEnvelope" });

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/members",
  request: { params: validatorOrganizationMemberOrganizationParams },
  responses: {
    200: {
      description: "Organization members",
      content: { "application/json": { schema: dtoOrganizationMemberListEnvelope } }
    }
  }
});

openApiRegistry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/members",
  request: {
    params: validatorOrganizationMemberOrganizationParams,
    body: { content: { "application/json": { schema: validatorOrganizationMemberBody } } }
  },
  responses: {
    201: {
      description: "Organization member added",
      content: { "application/json": { schema: dtoOrganizationMemberEnvelope } }
    }
  }
});

openApiRegistry.registerPath({
  method: "patch",
  path: "/api/v1/organizations/{organizationId}/members/{memberId}",
  request: {
    params: validatorOrganizationMemberParams,
    body: { content: { "application/json": { schema: validatorOrganizationMemberRoleBody } } }
  },
  responses: {
    200: {
      description: "Organization member updated",
      content: { "application/json": { schema: dtoOrganizationMemberEnvelope } }
    }
  }
});

openApiRegistry.registerPath({
  method: "delete",
  path: "/api/v1/organizations/{organizationId}/members/{memberId}",
  request: { params: validatorOrganizationMemberParams },
  responses: { 200: { description: "Organization member removed" } }
});
