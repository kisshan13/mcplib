import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  controllerCompletePlatformMcpOAuth,
  controllerStartPlatformMcpOAuth
} from "./controller.js";

export const mcpOAuthRoutes: Router = Router();
mcpOAuthRoutes.get("/:id/oauth/authorize", authMiddleware(), controllerStartPlatformMcpOAuth);
mcpOAuthRoutes.get("/:id/oauth/callback", authMiddleware(), controllerCompletePlatformMcpOAuth);

export default mcpOAuthRoutes;
