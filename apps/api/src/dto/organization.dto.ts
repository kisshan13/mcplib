import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import {
  validatorCreateOrganizationBody,
  validatorOrganizationParams,
  validatorUpdateOrganizationBody
} from "../routes/organizations/validator.js";

export const dtoOrganization = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })
  .meta({ id: "Organization" });

export type OrganizationResponse = z.infer<typeof dtoOrganization>;

export const dtoOrganizationList = z.array(dtoOrganization).meta({ id: "OrganizationList" });

export const dtoOrganizationEnvelope = z
  .object({
    data: dtoOrganization,
    message: z.string(),
    success: z.boolean()
  })
  .meta({ id: "OrganizationEnvelope" });

export const dtoOrganizationListEnvelope = z
  .object({
    data: dtoOrganizationList,
    message: z.string(),
    success: z.boolean()
  })
  .meta({ id: "OrganizationListEnvelope" });

openApiRegistry.registerPath({
  method: "post",
  path: "/api/v1/organizations",
  request: {
    body: {
      content: {
        "application/json": { schema: validatorCreateOrganizationBody }
      }
    }
  },
  responses: {
    201: {
      description: "Organization created",
      content: {
        "application/json": { schema: dtoOrganizationEnvelope }
      }
    }
  }
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/organizations",
  responses: {
    200: {
      description: "Organizations accessible to the authenticated user",
      content: {
        "application/json": { schema: dtoOrganizationListEnvelope }
      }
    }
  }
});

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/organizations/{id}",
  request: { params: validatorOrganizationParams },
  responses: {
    200: {
      description: "Organization details",
      content: {
        "application/json": { schema: dtoOrganizationEnvelope }
      }
    }
  }
});

openApiRegistry.registerPath({
  method: "patch",
  path: "/api/v1/organizations/{id}",
  request: {
    params: validatorOrganizationParams,
    body: {
      content: {
        "application/json": { schema: validatorUpdateOrganizationBody }
      }
    }
  },
  responses: {
    200: {
      description: "Organization updated",
      content: {
        "application/json": { schema: dtoOrganizationEnvelope }
      }
    }
  }
});
