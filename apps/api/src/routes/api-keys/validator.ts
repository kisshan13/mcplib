import { z } from "zod";

export const validatorApiKeyIdParams = z.object({ keyId: z.string().trim().min(1) });
export const validatorApiKeyMcpParams = validatorApiKeyIdParams.extend({
  mcpId: z.string().trim().min(1)
});

export const validatorCreateApiKeyBody = z
  .object({
    name: z.string().trim().min(1).max(120),
    type: z.enum(["platform", "organization"]),
    description: z.string().trim().max(1000).nullable().optional(),
    organizationId: z.string().trim().min(1).optional(),
    expiresAt: z.string().datetime({ offset: true }).optional(),
    expirationDays: z.coerce.number().int().min(1).max(3650).optional()
  })
  .strict()
  .superRefine((body, context) => {
    if (body.expiresAt && body.expirationDays !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Use either expiresAt or expirationDays, not both."
      });
    }
    if (body.type === "organization" && !body.organizationId) {
      context.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "organizationId is required for organization keys."
      });
    }
    if (body.type === "platform" && body.organizationId) {
      context.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "organizationId is not allowed for platform keys."
      });
    }
  });

export const validatorListApiKeysQuery = z
  .object({
    type: z.enum(["platform", "organization"]).optional(),
    status: z.enum(["active", "revoked", "expired"]).optional(),
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
  })
  .strict();

export const validatorGrantMcpAccessBody = z.object({ mcpId: z.string().trim().min(1) }).strict();
