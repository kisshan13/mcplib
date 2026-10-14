import { drive, drive_v3 } from "@googleapis/drive";
import { driveactivity, driveactivity_v2 } from "@googleapis/driveactivity";
import { drivelabels, drivelabels_v2 } from "@googleapis/drivelabels";
import { McpRuntimeContext } from "@packages/mcp-core";
import { SecretProviderError } from "@packages/mcplib-core";
import { normalizeGoogleDriveError } from "./errors.js";

const secretRequest = {
  integrationId: "google-drive-mcp",
  serviceProvider: "google-drive",
  secretId: "google-oauth",
  operation: "use" as const,
  purpose: "google-drive-tool"
};

export interface GoogleDriveClients {
  drive: drive_v3.Drive;
  activity: driveactivity_v2.Driveactivity;
  labels: drivelabels_v2.Drivelabels;
}

const clientsByContext = new WeakMap<object, Promise<GoogleDriveClients>>();

export function createGoogleDriveClients(accessToken: string): GoogleDriveClients {
  const token = accessToken.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw new SecretProviderError("The configured Google credential is empty.", "UNAVAILABLE");
  }

  return {
    drive: drive({ version: "v3", auth: token }),
    activity: driveactivity({ version: "v2", auth: token }),
    labels: drivelabels({ version: "v2", auth: token })
  };
}

export function getGoogleDriveClients(context: McpRuntimeContext): Promise<GoogleDriveClients> {
  const existing = clientsByContext.get(context);
  if (existing) return existing;

  const clients = (async () => {
    try {
      const secret = await context.secretProvider.getSecret({
        ...secretRequest,
        userId: context.userId,
        organizationId: context.organizationId,
        profileId: context.profileId,
        externalUserIdentity: context.externalUserIdentity
      });
      if (secret.type !== "header" || secret.secretType !== "bearer" || !secret.value) {
        throw new SecretProviderError(
          "The configured Google credential is not a bearer token.",
          "UNAVAILABLE"
        );
      }
      return createGoogleDriveClients(secret.value);
    } catch (error) {
      throw normalizeGoogleDriveError("authenticate Google Drive", error);
    }
  })();
  clientsByContext.set(context, clients);
  return clients;
}

export const googleDriveScopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.activity",
  "https://www.googleapis.com/auth/drive.labels"
] as const;
