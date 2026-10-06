import type { RequestHandler } from "express";
import { dtoExampleResponse } from "../../dto/example.dto.js";
import ApiResponse from "../../lib/response.js";
import { requestHandler } from "../../utils/request-handler.js";
import { validatorExampleQuery } from "./validator.js";

export const controllerGetExample: RequestHandler = requestHandler(async (req) => {
  const query = validatorExampleQuery.parse(req.query);
  const name = query.name ?? "workspace";

  const data = dtoExampleResponse.parse({
    name,
    message: `Hello from the API, ${name}!`
  });

  return new ApiResponse(data, "Example response");
});