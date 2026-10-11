import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  controllerCompletePlatformMcpOAuth,
  controllerStartPlatformMcpOAuth
} from "./controller.js";

export function factoryMcpOAuthRouter(): Router {
  const router = Router();

  router.get("/:id/oauth/authorize", authMiddleware(), controllerStartPlatformMcpOAuth);
  router.get("/:id/oauth/callback", authMiddleware(), controllerCompletePlatformMcpOAuth);

  return router;
}
