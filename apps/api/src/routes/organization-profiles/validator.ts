import { z } from "zod";

export const validatorOrganizationProfileParams = z.object({
  organizationId: z.string().trim().min(1)
});

export const validatorOrganizationProfileIdParams = validatorOrganizationProfileParams.extend({
  profileId: z.string().trim().min(1)
});

const metadata = z.record(z.string(), z.unknown()).nullable().optional();

export const validatorCreateOrganizationProfileBody = z
  .object({
    name: z.string().trim().min(1).max(200),
    profilePicUrl: z.string().url().max(2000).nullable().optional(),
    email: z.string().email().max(320).nullable().optional(),
    metadata,
    providerId: z.string().trim().min(1).max(200)
  })
  .strict();

export const validatorUpdateOrganizationProfileBody = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    profilePicUrl: z.string().url().max(2000).nullable().optional(),
    email: z.string().email().max(320).nullable().optional(),
    metadata,
    providerId: z.string().trim().min(1).max(200).optional()
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, "At least one field is required.");
