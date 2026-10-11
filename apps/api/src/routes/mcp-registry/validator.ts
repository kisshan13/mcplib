import { z } from "zod";

export const validatorMcpRegistryParams = z.object({
  id: z.string().trim().min(1)
});

export const validatorMcpConfigurationContext = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("platform"),
      id: z.undefined().optional()
    })
    .strict(),
  z
    .object({
      type: z.literal("organization"),
      id: z.string().trim().min(1)
    })
    .strict()
]);

export type McpConfigurationContext = z.infer<typeof validatorMcpConfigurationContext>;

export const validatorMcpConfigurationQuery = z
  .object({
    context: z.enum(["platform", "organization"]),
    organizationId: z.string().trim().min(1).optional()
  })
  .strict()
  .superRefine((query, context) => {
    if (query.context === "organization" && !query.organizationId) {
      context.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "organizationId is required for organization context."
      });
    }

    if (query.context === "platform" && query.organizationId) {
      context.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "organizationId is not allowed for platform context."
      });
    }
  });

export const validatorMcpConfigurationBody = z
  .object({
    context: validatorMcpConfigurationContext,
    values: z.record(z.string(), z.unknown())
  })
  .strict();
