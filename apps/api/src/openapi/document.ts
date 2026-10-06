import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import "../dto/index.js";
import { openApiRegistry } from "./registry.js";

export function createOpenApiDocument(): ReturnType<OpenApiGeneratorV31["generateDocument"]> {
  return new OpenApiGeneratorV31(openApiRegistry.definitions).generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Workspace API",
      version: "0.0.0"
    },
    servers: [{ url: "http://localhost:3000" }]
  });
}
