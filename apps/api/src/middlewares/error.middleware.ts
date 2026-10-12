import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/error.js";
import logger from "../lib/pino.js";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.log(error);
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Invalid request",
      details: error.flatten()
    });
    return;
  }

  if (!(error instanceof ApiError)) {
    logger.error(
      {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : { message: String(error) }
      },
      "Unhandled API error"
    );
  }

  const apiError = error instanceof ApiError ? error : new ApiError("Internal server error");

  res.status(apiError.status).json({
    success: false,
    message: apiError.message,
    details: apiError.details
  });
};

export default errorMiddleware;
