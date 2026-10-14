import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { resultSchema } from "../schemas.js";
import { fieldsSchema, idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

const revisionFields =
  "nextPageToken,revisions(id,mimeType,modifiedTime,keepForever,published,exportLinks,size,originalFilename)";

export function registerRevisionTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-list-revisions",
    description:
      "Lists revisions for a Google Drive file. Some file types expose incomplete revision history by API design.",
    inputSchema: z.object({
      fileId: idSchema,
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list revisions", () =>
        drive.revisions.list({
          fileId: input.fileId,
          pageSize: Math.min(input.pageSize, 1000),
          pageToken: input.pageToken,
          fields: input.fields ?? revisionFields
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-get-revision",
    description:
      "Retrieves revision metadata, or bounded revision content as base64 when downloadContent is requested.",
    inputSchema: z.object({
      fileId: idSchema,
      revisionId: idSchema,
      downloadContent: z.boolean().default(false),
      acknowledgeAbuse: z.boolean().default(false),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      if (!input.downloadContent) {
        const response = await withGoogleDriveError("get revision", () =>
          drive.revisions.get({
            fileId: input.fileId,
            revisionId: input.revisionId,
            fields:
              input.fields ??
              revisionFields.replace("nextPageToken,revisions(", "").replace(")", "")
          })
        );
        return { result: response.data };
      }
      const response = await withGoogleDriveError("download revision", () =>
        drive.revisions.get(
          {
            fileId: input.fileId,
            revisionId: input.revisionId,
            acknowledgeAbuse: input.acknowledgeAbuse,
            alt: "media"
          },
          { responseType: "arraybuffer" }
        )
      );
      const content = Buffer.from(response.data as ArrayBuffer);
      if (content.byteLength > 8 * 1024 * 1024)
        throw new Error("Revision content exceeds the 8 MiB MCP limit.");
      return {
        result: {
          fileId: input.fileId,
          revisionId: input.revisionId,
          contentBase64: content.toString("base64"),
          byteLength: content.byteLength
        }
      };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-update-revision",
    description: "Updates supported revision properties such as keepForever.",
    inputSchema: z.object({
      fileId: idSchema,
      revisionId: idSchema,
      keepForever: z.boolean(),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "update revision",
        () =>
          drive.revisions.update({
            fileId: input.fileId,
            revisionId: input.revisionId,
            requestBody: { keepForever: input.keepForever },
            fields:
              input.fields ??
              revisionFields.replace("nextPageToken,revisions(", "").replace(")", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-delete-revision",
    description:
      "Deletes a revision when Google Drive permits it. This is destructive and requires explicit confirmation.",
    inputSchema: z.object({
      fileId: idSchema,
      revisionId: idSchema,
      confirmDeletion: z.literal(true)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      await withGoogleDriveError(
        "delete revision",
        () => drive.revisions.delete({ fileId: input.fileId, revisionId: input.revisionId }),
        { retry: false }
      );
      return { result: { deleted: true, fileId: input.fileId, revisionId: input.revisionId } };
    }
  });
}
