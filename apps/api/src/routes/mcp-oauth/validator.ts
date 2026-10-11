import { z } from "zod";

export const validatorMcpOAuthParams = z.object({
  id: z.string().trim().min(1)
});

export const validatorMcpOAuthCallbackQuery = z.object({
  code: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  error: z.string().trim().min(1).optional(),
  error_description: z.string().trim().min(1).optional()
});
