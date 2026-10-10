import type { ApiEnvelope } from "./api";

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationInput = {
  name: string;
  description?: string | null;
};

export type UpdateOrganizationInput = {
  name?: string;
  description?: string | null;
};

export type OrganizationResponseEnvelope = ApiEnvelope<Organization>;
export type OrganizationListResponseEnvelope = ApiEnvelope<Organization[]>;
