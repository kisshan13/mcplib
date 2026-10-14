import { McpToolkit, type McpToolkitRegister } from "@packages/mcp-core";
import { SecretProviderConfiguration } from "@packages/mcplib-core";
import { z } from "zod";
import { googleDriveScopes } from "./client.js";
import { registerActivityTools } from "./tools/activity.js";
import { registerChangeTools } from "./tools/changes.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerSharedDriveTools } from "./tools/drives.js";
import { registerFileTools } from "./tools/files.js";
import { registerLabelTools } from "./tools/labels.js";
import { registerPermissionTools } from "./tools/permissions.js";
import { registerRevisionTools } from "./tools/revisions.js";

const mcp = new McpToolkit({
  id: "google-drive-mcp",
  name: "google-drive-mcp",
  displayName: "Google Drive",
  description:
    "Manage Google Drive files, permissions, shared drives, comments, revisions, changes, activity, and labels as the connected user.",
  version: "v1.0.0",
  serviceProvider: "google-drive",
  capabilities: ["tools", "google-drive", "google-drive-activity", "google-drive-labels"],
  secretProviderConfiguration: new SecretProviderConfiguration({
    type: "configuration",
    secretId: "google-oauth",
    inputSchema: z.object({
      clientId: z
        .string()
        .trim()
        .min(1)
        .describe("Google OAuth client ID configured by the platform."),
      clientSecret: z
        .string()
        .min(1)
        .meta({ secret: true })
        .describe("Google OAuth client secret configured by the platform.")
    }),
    oauth: {
      issuer: "https://accounts.google.com",
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: googleDriveScopes
    }
  })
});

registerFileTools(mcp);
registerPermissionTools(mcp);
registerSharedDriveTools(mcp);
registerCommentTools(mcp);
registerRevisionTools(mcp);
registerChangeTools(mcp);
registerActivityTools(mcp);
registerLabelTools(mcp);

const register: McpToolkitRegister = mcp.asRegister();

export { createGoogleDriveClients, getGoogleDriveClients } from "./client.js";
export { GoogleDriveMcpError, normalizeGoogleDriveError } from "./errors.js";
export { googleDriveScopes } from "./client.js";
export default register;
