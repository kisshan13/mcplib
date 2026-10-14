import { randomUUID } from "node:crypto";
import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { resultSchema } from "../schemas.js";
import { fieldsSchema, idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

const driveFields =
  "nextPageToken,drives(id,name,createdTime,hidden,orgUnitId,restrictions,capabilities)";
const driveGetFields =
  "id,name,createdTime,hidden,orgUnitId,restrictions,capabilities,backgroundImageFile,themeId,colorRgb,defaultRestrictions";

export function registerSharedDriveTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-list-shared-drives",
    description: "Lists shared drives visible to the connected Google account.",
    inputSchema: z.object({
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      query: z.string().trim().max(1000).optional(),
      fields: fieldsSchema,
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list shared drives", () =>
        drive.drives.list({
          pageSize: Math.min(input.pageSize, 100),
          pageToken: input.pageToken,
          q: input.query,
          fields: input.fields ?? driveFields,
          useDomainAdminAccess: input.useDomainAdminAccess
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-get-shared-drive",
    description: "Retrieves shared drive metadata, restrictions, and capabilities.",
    inputSchema: z.object({
      driveId: idSchema,
      fields: fieldsSchema,
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get shared drive", () =>
        drive.drives.get({
          driveId: input.driveId,
          fields: input.fields ?? driveGetFields,
          useDomainAdminAccess: input.useDomainAdminAccess
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-create-shared-drive",
    description: "Creates a shared drive for the connected account when Google authorizes it.",
    inputSchema: z.object({
      name: z.string().trim().min(1).max(255),
      requestId: z.string().trim().min(1).max(200).default(""),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "create shared drive",
        () =>
          drive.drives.create({
            requestId: input.requestId || randomUUID(),
            requestBody: { name: input.name },
            fields: input.fields ?? driveGetFields
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-update-shared-drive",
    description: "Updates supported metadata on a shared drive.",
    inputSchema: z.object({
      driveId: idSchema,
      name: z.string().trim().min(1).max(255).optional(),
      hidden: z.boolean().optional(),
      restrictions: z.record(z.string(), z.unknown()).optional(),
      fields: fieldsSchema,
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "update shared drive",
        () =>
          drive.drives.update({
            driveId: input.driveId,
            requestBody: {
              name: input.name,
              hidden: input.hidden,
              restrictions: input.restrictions
            },
            fields: input.fields ?? driveGetFields,
            useDomainAdminAccess: input.useDomainAdminAccess
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-delete-shared-drive",
    description:
      "Deletes a shared drive. This is destructive and requires explicit confirmation; item deletion is separately explicit.",
    inputSchema: z.object({
      driveId: idSchema,
      confirmDeletion: z.literal(true),
      allowItemDeletion: z.boolean().default(false),
      useDomainAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      await withGoogleDriveError(
        "delete shared drive",
        () =>
          drive.drives.delete({
            driveId: input.driveId,
            allowItemDeletion: input.allowItemDeletion,
            useDomainAdminAccess: input.useDomainAdminAccess
          }),
        { retry: false }
      );
      return { result: { deleted: true, driveId: input.driveId } };
    }
  });
}
