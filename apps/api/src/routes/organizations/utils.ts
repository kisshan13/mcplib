import { dtoOrganization, type OrganizationResponse } from "../../dto/organization.dto.js";

export function toOrganizationResponse(organization: {
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
