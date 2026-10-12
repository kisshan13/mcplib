import { z } from "zod";
import { validatorRegisterServiceTokenBody } from "../organization-service-tokens/validator.js";

export const validatorOrganizationProfileServiceTokenParams = z.object({
  organizationId: z.string().trim().min(1),
  profileId: z.string().trim().min(1)
});

export const validatorOrganizationProfileServiceTokenIdParams =
  validatorOrganizationProfileServiceTokenParams.extend({
    tokenId: z.string().trim().min(1)
  });

export { validatorRegisterServiceTokenBody };
