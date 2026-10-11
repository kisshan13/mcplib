import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/error.js";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Invalid request",
      details: error.flatten()
    });
    return;
  }

  const apiError = error instanceof ApiError ? error : new ApiError("Internal server error");

  res.status(apiError.status).json({
    success: false,
    message: apiError.message,
    details: apiError.details
  });
};

export default errorMiddleware;
