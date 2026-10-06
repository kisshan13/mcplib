import type { ErrorRequestHandler } from "express";
import { ApiError } from "../lib/error.js";

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const apiError = error instanceof ApiError ? error : new ApiError("Internal server error");

  res.status(apiError.status).json({
    success: false,
    message: apiError.message,
    details: apiError.details
  });
};

export default errorMiddleware;
