import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { resultSchema } from "../schemas.js";
import { fieldsSchema, idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

const changeFields =
  "nextPageToken,newStartPageToken,changes(fileId,removed,time,file(id,name,mimeType,parents,driveId,trashed,modifiedTime,createdTime,webViewLink),changeType)";

export function registerChangeTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-get-start-page-token",
    description:
      "Gets an opaque start page token for polling Google Drive changes, optionally scoped to a shared drive.",
    inputSchema: z.object({ driveId: idSchema.optional() }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get changes start page token", () =>
        drive.changes.getStartPageToken({ driveId: input.driveId, supportsAllDrives: true })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-list-changes",
    description:
      "Lists Google Drive changes after an opaque page token. Removed-resource entries are preserved and pagination tokens are returned.",
    inputSchema: z.object({
      pageToken: pageTokenSchema.or(idSchema),
      pageSize: pageSizeSchema,
      driveId: idSchema.optional(),
      includeCorpusRemovals: z.boolean().default(true),
      includeItemsFromAllDrives: z.boolean().default(true),
      restrictToMyDrive: z.boolean().default(false),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list changes", () =>
        drive.changes.list({
          pageToken: input.pageToken,
          pageSize: Math.min(input.pageSize, 1000),
          driveId: input.driveId,
          includeCorpusRemovals: input.includeCorpusRemovals,
          includeItemsFromAllDrives: input.includeItemsFromAllDrives,
          restrictToMyDrive: input.restrictToMyDrive,
          supportsAllDrives: true,
          fields: input.fields ?? changeFields
        })
      );
      return { result: response.data };
    }
  });
}
