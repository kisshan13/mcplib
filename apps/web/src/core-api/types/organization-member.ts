import type { ApiEnvelope } from "./api";

export type OrganizationMemberRole = "owner" | "administrator" | "member";

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type AddOrganizationMemberInput = {
  userId?: string;
  email?: string;
  role?: Exclude<OrganizationMemberRole, "owner">;
};

export type UpdateOrganizationMemberInput = {
  role: Exclude<OrganizationMemberRole, "owner">;
};

export type OrganizationMemberResponseEnvelope = ApiEnvelope<OrganizationMember>;
export type OrganizationMemberListResponseEnvelope = ApiEnvelope<OrganizationMember[]>;
