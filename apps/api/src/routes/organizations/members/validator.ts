import { z } from "zod";

export const validatorOrganizationMemberParams = z.object({
  organizationId: z.string().trim().min(1),
  memberId: z.string().trim().min(1)
});

export const validatorOrganizationMemberOrganizationParams = z.object({
  organizationId: z.string().trim().min(1)
});

export const validatorOrganizationMemberBody = z
  .object({
    userId: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    role: z.enum(["administrator", "member"]).default("member")
  })
  .strict()
  .superRefine((body, context) => {
    if (!body.userId && !body.email) {
      context.addIssue({
        code: "custom",
        path: ["userId"],
        message: "Either userId or email is required."
      });
    }
    if (body.userId && body.email) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Use either userId or email, not both."
      });
    }
  });

export const validatorOrganizationMemberRoleBody = z
  .object({ role: z.enum(["administrator", "member"]) })
  .strict();
