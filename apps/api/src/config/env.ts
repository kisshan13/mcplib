import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3001,http://127.0.0.1:6274"),
  WEB_APP_URL: z.string().url().default("http://localhost:3001"),
  MCPLIB_SECRET_ENCRYPTION_KEY: z.string().trim().optional(),
  GITHUB_OAUTH_CLIENT_ID: z.string().trim().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().trim().optional(),
  GITHUB_OAUTH_REDIRECT_URI: z.string().url().optional()
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export type Env = z.infer<typeof envSchema>;
