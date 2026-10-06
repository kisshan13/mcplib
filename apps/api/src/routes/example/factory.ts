import { Router } from "express";
import { controllerGetExample } from "./controller.js";

export function factoryExampleRouter(): Router {
  const router = Router();

  router.get("/", controllerGetExample);

  return router;
}
