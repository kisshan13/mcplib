import { McpToolkit } from "@packages/mcp-core";
import { drive_v3 } from "@googleapis/drive";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { permissionInput, resultSchema } from "../schemas.js";
import { fieldsSchema, idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

const permissionFields =
  "nextPageToken,permissions(id,type,role,emailAddress,domain,displayName,expirationTime,deleted,pendingOwner,permissionDetails)";

function assertPermissionRecipient(input: {
  type: string;
  emailAddress?: string;
  domain?: string;
}): void {
  if ((input.type === "user" || input.type === "group") && !input.emailAddress) {
    throw new Error("emailAddress is required for user and group permissions.");
  }
  if (input.type === "domain" && !input.domain)
    throw new Error("domain is required for domain permissions.");
  if (input.type === "anyone" && (input.emailAddress || input.domain))
    throw new Error("anyone permissions cannot include a recipient.");
}

function permissionBody(input: z.infer<typeof permissionInput>): drive_v3.Schema$Permission {
  assertPermissionRecipient(input);
  return {
    type: input.type,
    role: input.role,
    emailAddress: input.emailAddress,
    domain: input.domain,
    allowFileDiscovery: input.allowFileDiscovery,
    expirationTime: input.expirationTime
  };
}

export function registerPermissionTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-list-permissions",
    description: "Lists permissions for a Google Drive file or shared drive with pagination.",
    inputSchema: z.object({
      fileId: idSchema,
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      fields: fieldsSchema,
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list permissions", () =>
        drive.permissions.list({
          fileId: input.fileId,
          pageSize: Math.min(input.pageSize, 100),
          pageToken: input.pageToken,
          fields: input.fields ?? permissionFields,
          supportsAllDrives: true,
          useDomainAdminAccess: input.useDomainAdminAccess
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-get-permission",
    description: "Retrieves one permission for a Google Drive file or shared drive.",
    inputSchema: z.object({
      fileId: idSchema,
      permissionId: idSchema,
      fields: fieldsSchema,
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get permission", () =>
        drive.permissions.get({
          fileId: input.fileId,
          permissionId: input.permissionId,
          fields: input.fields ?? permissionFields.replace("nextPageToken,", ""),
          supportsAllDrives: true,
          useDomainAdminAccess: input.useDomainAdminAccess
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-create-permission",
    description:
      "Grants access to a Google Drive file or folder. Domain and anyone access require explicit sensitive-operation confirmation.",
    inputSchema: z.object({
      fileId: idSchema,
      permission: permissionInput,
      sendNotificationEmail: z.boolean().default(true),
      confirmSensitiveSharing: z.boolean().default(false),
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      if (
        (input.permission.type === "domain" || input.permission.type === "anyone") &&
        !input.confirmSensitiveSharing
      )
        throw new Error("confirmSensitiveSharing must be true for domain or public sharing.");
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "create permission",
        () =>
          drive.permissions.create({
            fileId: input.fileId,
            requestBody: permissionBody(input.permission),
            sendNotificationEmail: input.sendNotificationEmail,
            supportsAllDrives: true,
            useDomainAdminAccess: input.useDomainAdminAccess,
            fields: permissionFields.replace("nextPageToken,", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-update-permission",
    description: "Updates the role or expiration of an existing Google Drive permission.",
    inputSchema: z.object({
      fileId: idSchema,
      permissionId: idSchema,
      role: z.enum(["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"]),
      expirationTime: permissionInput.shape.expirationTime,
      removeExpiration: z.boolean().default(false),
      transferOwnership: z.boolean().default(false),
      confirmOwnershipTransfer: z.boolean().default(false),
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      if (input.transferOwnership && !input.confirmOwnershipTransfer)
        throw new Error("confirmOwnershipTransfer must be true to transfer ownership.");
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "update permission",
        () =>
          drive.permissions.update({
            fileId: input.fileId,
            permissionId: input.permissionId,
            requestBody: {
              role: input.role,
              expirationTime: input.removeExpiration ? undefined : input.expirationTime
            },
            transferOwnership: input.transferOwnership,
            removeExpiration: input.removeExpiration,
            supportsAllDrives: true,
            useDomainAdminAccess: input.useDomainAdminAccess,
            fields: permissionFields.replace("nextPageToken,", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-delete-permission",
    description:
      "Removes access granted by a Google Drive permission. This is externally visible and cannot be retried blindly.",
    inputSchema: z.object({
      fileId: idSchema,
      permissionId: idSchema,
      confirmAccessRemoval: z.literal(true),
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      await withGoogleDriveError(
        "delete permission",
        () =>
          drive.permissions.delete({
            fileId: input.fileId,
            permissionId: input.permissionId,
            supportsAllDrives: true,
            useDomainAdminAccess: input.useDomainAdminAccess
          }),
        { retry: false }
      );
      return { result: { deleted: true, fileId: input.fileId, permissionId: input.permissionId } };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-get-file-capabilities",
    description: "Retrieves the connected user's Drive capabilities for a file.",
    inputSchema: z.object({ fileId: idSchema }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get file capabilities", () =>
        drive.files.get({
          fileId: input.fileId,
          fields: "id,name,driveId,capabilities",
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });
}
