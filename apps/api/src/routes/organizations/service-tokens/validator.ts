import { z } from "zod";

export const validatorOrganizationServiceTokenParams = z.object({
  organizationId: z.string().trim().min(1),
  userId: z.string().trim().min(1)
});

export const validatorOrganizationServiceTokenIdParams =
  validatorOrganizationServiceTokenParams.extend({
    tokenId: z.string().trim().min(1)
  });

export const validatorOrganizationProfileServiceTokenParams = z.object({
  organizationId: z.string().trim().min(1),
  profileId: z.string().trim().min(1)
});

export const validatorOrganizationProfileServiceTokenIdParams =
  validatorOrganizationProfileServiceTokenParams.extend({
    tokenId: z.string().trim().min(1)
  });

export const validatorRegisterServiceTokenBody = z
  .object({
    secretId: z.string().trim().min(1).max(120),
    integrationId: z.string().trim().min(1).max(120),
    serviceProvider: z.string().trim().min(1).max(120).optional(),
    authenticationMethod: z.enum(["oauth", "api_key", "bearer_token", "basic_auth", "custom"]),
    accessToken: z.string().min(1).optional(),
    refreshToken: z.string().min(1).optional(),
    credentialReference: z.string().trim().min(1).max(500).optional(),
    accessTokenExpiresAt: z.string().datetime({ offset: true }).optional(),
    refreshTokenExpiresAt: z.string().datetime({ offset: true }).optional(),
    grantedScopes: z.array(z.string().trim().min(1).max(200)).max(100).default([])
  })
  .strict()
  .superRefine((body, context) => {
    if (!body.accessToken && !body.credentialReference) {
      context.addIssue({
        code: "custom",
        path: ["accessToken"],
        message: "Either accessToken or credentialReference is required."
      });
    }
    if (body.accessToken && body.credentialReference) {
      context.addIssue({
        code: "custom",
        path: ["accessToken"],
        message: "Use either accessToken or credentialReference, not both."
      });
    }
  });
