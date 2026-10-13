import { OrganizationRole } from "@packages/prisma";
import { ApiError } from "../../lib/error.js";
import {
  createOrganizationMember,
  deleteOrganizationMember,
  findOrganizationMember,
  findUserProfile,
  isDuplicateMembership,
  listOrganizationMembers,
  requireOrganizationManager,
  requireOrganizationMember,
  updateOrganizationMember
} from "./service.js";

export function listOrganizationMembersForUser(organizationId: string, userId: string) {
  return requireOrganizationMember(organizationId, userId).then(() =>
    listOrganizationMembers(organizationId)
  );
}

export async function addOrganizationMemberForUser(
  organizationId: string,
  input: { userId?: string; email?: string; role: "administrator" | "member" },
  userId: string
) {
  await requireOrganizationManager(organizationId, userId);
  const user = await findUserProfile({ userId: input.userId, email: input.email });
  if (!user) throw new ApiError("User profile not found", 404);
  try {
    return await createOrganizationMember({
      organizationId,
      userId: user.id,
      role:
        input.role === "administrator" ? OrganizationRole.ADMINISTRATOR : OrganizationRole.MEMBER
    });
  } catch (error) {
    if (isDuplicateMembership(error)) {
      throw new ApiError("This user is already an organization member", 409);
    }
    throw error;
  }
}

async function getManagedMember(organizationId: string, memberId: string, userId: string) {
  const actor = await requireOrganizationManager(organizationId, userId);
  const member = await findOrganizationMember(organizationId, memberId);
  if (!member) throw new ApiError("Organization member not found", 404);
  return { actor, member };
}

export async function updateOrganizationMemberForUser(
  organizationId: string,
  memberId: string,
  role: "administrator" | "member",
  userId: string
) {
  const { actor, member } = await getManagedMember(organizationId, memberId, userId);
  if (
    member.role === OrganizationRole.OWNER ||
    (role === "administrator" && actor.role !== OrganizationRole.OWNER)
  ) {
    throw new ApiError("You do not have permission to change this member's role", 403);
  }
  return updateOrganizationMember(
    memberId,
    role === "administrator" ? OrganizationRole.ADMINISTRATOR : OrganizationRole.MEMBER
  );
}

export async function deleteOrganizationMemberForUser(
  organizationId: string,
  memberId: string,
  userId: string
) {
  const { actor, member } = await getManagedMember(organizationId, memberId, userId);
  if (
    member.role === OrganizationRole.OWNER ||
    (member.role === OrganizationRole.ADMINISTRATOR && actor.role !== OrganizationRole.OWNER)
  ) {
    throw new ApiError("You do not have permission to remove this member", 403);
  }
  await deleteOrganizationMember(memberId);
}
