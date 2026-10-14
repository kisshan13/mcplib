import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { resultSchema } from "../schemas.js";
import { fieldsSchema, idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

const commentFields =
  "nextPageToken,comments(id,kind,createdTime,modifiedTime,author(displayName,emailAddress,photoLink),content,htmlContent,resolved,deleted,quotedFileContent)";
const replyFields =
  "nextPageToken,replies(id,kind,createdTime,modifiedTime,author(displayName,emailAddress,photoLink),content,deleted)";

export function registerCommentTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-list-comments",
    description: "Lists comments on a Google Drive file with author and status metadata.",
    inputSchema: z.object({
      fileId: idSchema,
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      includeDeleted: z.boolean().default(false),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list comments", () =>
        drive.comments.list({
          fileId: input.fileId,
          pageSize: Math.min(input.pageSize, 100),
          pageToken: input.pageToken,
          includeDeleted: input.includeDeleted,
          fields: input.fields ?? commentFields
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-get-comment",
    description: "Retrieves one comment from a Google Drive file.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      includeDeleted: z.boolean().default(false),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get comment", () =>
        drive.comments.get({
          fileId: input.fileId,
          commentId: input.commentId,
          includeDeleted: input.includeDeleted,
          fields:
            input.fields ?? commentFields.replace("nextPageToken,comments(", "").replace(")", "")
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-create-comment",
    description: "Creates a comment on a Google Drive file.",
    inputSchema: z.object({
      fileId: idSchema,
      content: z.string().trim().min(1).max(10000),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "create comment",
        () =>
          drive.comments.create({
            fileId: input.fileId,
            requestBody: { content: input.content },
            fields:
              input.fields ?? commentFields.replace("nextPageToken,comments(", "").replace(")", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-update-comment",
    description: "Updates the content of a Google Drive comment.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      content: z.string().trim().min(1).max(10000),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "update comment",
        () =>
          drive.comments.update({
            fileId: input.fileId,
            commentId: input.commentId,
            requestBody: { content: input.content },
            fields:
              input.fields ?? commentFields.replace("nextPageToken,comments(", "").replace(")", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-delete-comment",
    description:
      "Deletes a Google Drive comment. This is externally visible and requires explicit confirmation.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      confirmDeletion: z.literal(true)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      await withGoogleDriveError(
        "delete comment",
        () => drive.comments.delete({ fileId: input.fileId, commentId: input.commentId }),
        { retry: false }
      );
      return { result: { deleted: true, fileId: input.fileId, commentId: input.commentId } };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-list-replies",
    description: "Lists replies to a Google Drive comment.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      includeDeleted: z.boolean().default(false),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list replies", () =>
        drive.replies.list({
          fileId: input.fileId,
          commentId: input.commentId,
          pageSize: Math.min(input.pageSize, 100),
          pageToken: input.pageToken,
          includeDeleted: input.includeDeleted,
          fields: input.fields ?? replyFields
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-get-reply",
    description: "Retrieves one reply to a Google Drive comment.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      replyId: idSchema,
      includeDeleted: z.boolean().default(false),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get reply", () =>
        drive.replies.get({
          fileId: input.fileId,
          commentId: input.commentId,
          replyId: input.replyId,
          includeDeleted: input.includeDeleted,
          fields: input.fields ?? replyFields.replace("nextPageToken,replies(", "").replace(")", "")
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-create-reply",
    description: "Creates a reply to a Google Drive comment.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      content: z.string().trim().min(1).max(10000),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "create reply",
        () =>
          drive.replies.create({
            fileId: input.fileId,
            commentId: input.commentId,
            requestBody: { content: input.content },
            fields:
              input.fields ?? replyFields.replace("nextPageToken,replies(", "").replace(")", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-update-reply",
    description: "Updates the content of a Google Drive reply.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      replyId: idSchema,
      content: z.string().trim().min(1).max(10000),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "update reply",
        () =>
          drive.replies.update({
            fileId: input.fileId,
            commentId: input.commentId,
            replyId: input.replyId,
            requestBody: { content: input.content },
            fields:
              input.fields ?? replyFields.replace("nextPageToken,replies(", "").replace(")", "")
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-delete-reply",
    description:
      "Deletes a reply to a Google Drive comment. This is externally visible and requires explicit confirmation.",
    inputSchema: z.object({
      fileId: idSchema,
      commentId: idSchema,
      replyId: idSchema,
      confirmDeletion: z.literal(true)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      await withGoogleDriveError(
        "delete reply",
        () =>
          drive.replies.delete({
            fileId: input.fileId,
            commentId: input.commentId,
            replyId: input.replyId
          }),
        { retry: false }
      );
      return {
        result: {
          deleted: true,
          fileId: input.fileId,
          commentId: input.commentId,
          replyId: input.replyId
        }
      };
    }
  });
}
