import { z } from "zod";
import { openApiRegistry } from "../openapi/registry.js";
import { validatorExampleQuery } from "../routes/example/validator.js";

export const dtoExampleResponse = z.object({
  name: z.string(),
  message: z.string()
}).meta({ id: "ExampleResponse" });

export const dtoExampleResponseEnvelope = z.object({
  data: dtoExampleResponse,
  message: z.string(),
  success: z.boolean()
}).meta({ id: "ExampleResponseEnvelope" });

openApiRegistry.registerPath({
  method: "get",
  path: "/api/v1/example",
  request: { query: validatorExampleQuery },
  responses: {
    200: {
      description: "Example response",
      content: {
        "application/json": { schema: dtoExampleResponseEnvelope }
      }
    }
  }
});
