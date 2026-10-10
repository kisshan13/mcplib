import { z } from "zod";

const organizationName = z.string().trim().min(1).max(120);
const organizationDescription = z.string().trim().max(1000).nullable();

export const validatorOrganizationParams = z.object({
  id: z.string().trim().min(1)
});

export const validatorCreateOrganizationBody = z
  .object({
    name: organizationName,
    description: organizationDescription.optional()
  })
  .strict();

export const validatorUpdateOrganizationBody = z
  .object({
    name: organizationName.optional(),
    description: organizationDescription.optional()
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one organization field is required."
  });
