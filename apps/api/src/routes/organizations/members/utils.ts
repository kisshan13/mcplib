import { OrganizationRole } from "@packages/prisma";
import { dtoOrganizationMember } from "../../../dto/organization-member.dto.js";

export function toMemberResponse(member: {
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
