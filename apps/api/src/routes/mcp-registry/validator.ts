import { z } from "zod";

export const validatorMcpRegistryParams = z.object({
  id: z.string().trim().min(1)
});
