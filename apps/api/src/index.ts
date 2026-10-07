import "./config/env.js";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { auth } from "./lib/auth.js";
import { env, corsOrigins } from "./config/env.js";
import { toNodeHandler } from "better-auth/node";
import { createOpenApiDocument } from "./openapi/document.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import { exampleRoutes } from "./routes/index.js";

import exampleMcp from "@packages/example-mcp"

const app: Express = express();

app.set("trust proxy", 1);
app.use(loggerMiddleware);
app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

app.all("/api/auth/*splat", (req, res, next) => {
  toNodeHandler(auth)(req, res).catch(next);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/openapi.json", (_req, res) => {
  res.json(createOpenApiDocument());
});

app.use("/api/v1/example/mcp", async (req, res) => {
  console.log(req.body)
  await Promise.resolve(exampleMcp.register(req, res))
})

app.use("/api/v1/example", exampleRoutes);
app.use(errorMiddleware);

if (env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

export default app;
