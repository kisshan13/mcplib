import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import {
  validatorOrganizationProfileIdParams,
  validatorOrganizationProfileParams,
  validatorCreateOrganizationProfileBody,
  validatorUpdateOrganizationProfileBody
} from "../routes/organizations/profiles/validator.js";

export const dtoOrganizationProfile = z
  .object({
    id: z.string(),
    organizationId: z.string(),
    name: z.string(),
    profilePicUrl: z.string().nullable(),
    email: z.string().email().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    providerId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })
  .meta({ id: "OrganizationProfile" });

export const dtoOrganizationProfileList = z
  .array(dtoOrganizationProfile)
  .meta({ id: "OrganizationProfileList" });

const dtoEnvelope = <T extends z.ZodType>(schema: T, id: string) =>
  z.object({ data: schema, message: z.string(), success: z.boolean() }).meta({ id });

export const dtoOrganizationProfileEnvelope = dtoEnvelope(
  dtoOrganizationProfile,
  "OrganizationProfileEnvelope"
);
export const dtoOrganizationProfileListEnvelope = dtoEnvelope(
  dtoOrganizationProfileList,
  "OrganizationProfileListEnvelope"
);

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/profiles",
  request: { params: validatorOrganizationProfileParams },
  responses: {
    200: {
      description: "Organization profiles",
      content: { "application/json": { schema: dtoOrganizationProfileListEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "post",
  path: "/api/v1/organizations/{organizationId}/profiles",
  request: {
    params: validatorOrganizationProfileParams,
    body: { content: { "application/json": { schema: validatorCreateOrganizationProfileBody } } }
  },
  responses: {
    201: {
      description: "Organization profile created",
      content: { "application/json": { schema: dtoOrganizationProfileEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{organizationId}/profiles/{profileId}",
  request: { params: validatorOrganizationProfileIdParams },
  responses: {
    200: {
      description: "Organization profile",
      content: { "application/json": { schema: dtoOrganizationProfileEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "patch",
  path: "/api/v1/organizations/{organizationId}/profiles/{profileId}",
  request: {
    params: validatorOrganizationProfileIdParams,
    body: { content: { "application/json": { schema: validatorUpdateOrganizationProfileBody } } }
  },
  responses: {
    200: {
      description: "Organization profile updated",
      content: { "application/json": { schema: dtoOrganizationProfileEnvelope } }
    }
  }
});
openApiRegistry.registerPath({
  method: "delete",
  path: "/api/v1/organizations/{organizationId}/profiles/{profileId}",
  request: { params: validatorOrganizationProfileIdParams },
  responses: { 200: { description: "Organization profile deleted" } }
});
