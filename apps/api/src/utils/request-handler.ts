import type { NextFunction, Request, RequestHandler, Response } from "express";
import ApiResponse from "../lib/response.js";

type ControllerResult = ApiResponse | void;
type Controller = (req: Request, res: Response, next: NextFunction) => Promise<ControllerResult> | ControllerResult;

export function requestHandler(controller: Controller): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next))
      .then((response) => {
        if (!response || res.headersSent) return;

        res.status(response.status).json({
          data: response.data,
          message: response.message,
          success: response.success
        });
      })
      .catch(next);
  };
}
