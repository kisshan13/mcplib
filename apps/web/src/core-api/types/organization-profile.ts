import type { ApiEnvelope } from "./api";

export type OrganizationProfile = {
  id: string;
  organizationId: string;
  name: string;
  profilePicUrl: string | null;
  email: string | null;
  metadata: Record<string, unknown> | null;
  providerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationProfileInput = {
  name: string;
  profilePicUrl?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
  providerId: string;
};

export type UpdateOrganizationProfileInput = Partial<CreateOrganizationProfileInput>;
export type OrganizationProfileResponseEnvelope = ApiEnvelope<OrganizationProfile>;
export type OrganizationProfileListResponseEnvelope = ApiEnvelope<OrganizationProfile[]>;
