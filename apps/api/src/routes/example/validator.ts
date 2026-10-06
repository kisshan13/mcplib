import { z } from "zod";

export const validatorExampleQuery = z.object({
  name: z.string().trim().min(1).optional()
});
