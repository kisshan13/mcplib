import { dtoOrganizationProfile } from "../../../dto/organization-profile.dto.js";

export function toProfileResponse(profile: {
  id: string;
  organizationId: string;
  name: string;
  profilePicUrl: string | null;
  email: string | null;
  metadata: unknown;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return dtoOrganizationProfile.parse({
    ...profile,
    metadata: profile.metadata as Record<string, unknown> | null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  });
}
