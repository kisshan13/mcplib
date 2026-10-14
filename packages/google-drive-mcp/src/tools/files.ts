import { McpToolkit } from "@packages/mcp-core";
import { drive_v3 } from "@googleapis/drive";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { filePageInput, resultSchema } from "../schemas.js";
import {
  assertFileName,
  decodeBase64,
  fieldsSchema,
  idSchema,
  mimeTypeSchema,
  pageSizeSchema,
  pageTokenSchema
} from "../validation.js";

const fileFields =
  "nextPageToken,incompleteSearch,files(id,name,mimeType,description,parents,driveId,trashed,starred,createdTime,modifiedTime,webViewLink,webContentLink,iconLink,size,capabilities,permissions(permissionDetails,id,type,role,emailAddress,domain,displayName,expirationTime),owners(displayName,emailAddress),lastModifyingUser(displayName,emailAddress),shortcutDetails,targetId)";
const fileGetFields =
  "id,name,mimeType,description,parents,driveId,trashed,starred,createdTime,modifiedTime,viewedByMeTime,webViewLink,webContentLink,iconLink,size,md5Checksum,capabilities,permissions(permissionDetails,id,type,role,emailAddress,domain,displayName,expirationTime),owners(displayName,emailAddress),lastModifyingUser(displayName,emailAddress),headRevisionId,version,shortcutDetails,targetId,labelInfo";
const folderMimeType = "application/vnd.google-apps.folder";
const workspaceMimeTypes = new Set([
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.spreadsheet",
  "application/vnd.google-apps.presentation",
  "application/vnd.google-apps.drawing",
  "application/vnd.google-apps.script"
]);

function driveListParams(input: {
  pageSize: number;
  pageToken?: string;
  fields?: string;
  driveId?: string;
  q?: string;
  orderBy?: string;
  includeTrashed?: boolean;
}): drive_v3.Params$Resource$Files$List {
  const q = input.q ?? (input.includeTrashed ? undefined : "trashed = false");
  return {
    pageSize: input.pageSize,
    pageToken: input.pageToken,
    fields: input.fields ?? fileFields,
    q,
    orderBy: input.orderBy ?? "folder,name_natural",
    corpora: input.driveId ? "drive" : undefined,
    driveId: input.driveId,
    includeItemsFromAllDrives: Boolean(input.driveId),
    supportsAllDrives: true
  };
}

export function registerFileTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-list-files",
    description:
      "Lists Google Drive files and folders. Results are paginated and exclude trashed files by default.",
    inputSchema: filePageInput.extend({
      includeTrashed: z.boolean().default(false),
      orderBy: z.string().trim().max(200).optional()
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list files", () =>
        drive.files.list(driveListParams(input))
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-search-files",
    description:
      "Searches Google Drive using the native Drive q query syntax. The query is passed through unchanged apart from validation.",
    inputSchema: filePageInput.extend({
      q: z.string().trim().min(1).max(2048),
      orderBy: z.string().trim().max(200).optional()
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("search files", () =>
        drive.files.list(driveListParams(input))
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-list-folder-files",
    description:
      "Lists direct children of a Google Drive folder, with an explicit option to include trashed children.",
    inputSchema: z.object({
      folderId: idSchema,
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      fields: fieldsSchema,
      includeTrashed: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list folder files", () =>
        drive.files.list(
          driveListParams({
            ...input,
            q: `'${input.folderId.replace(/'/g, "\\'")}' in parents`,
            driveId: undefined
          })
        )
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-get-file",
    description:
      "Retrieves bounded Google Drive file metadata, links, capabilities, and permission metadata when authorized.",
    inputSchema: z.object({
      fileId: idSchema,
      fields: fieldsSchema,
      includeLabels: z.array(idSchema).max(100).optional()
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get file metadata", () =>
        drive.files.get({
          fileId: input.fileId,
          fields: input.fields ?? fileGetFields,
          includeLabels: input.includeLabels?.join(","),
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-create-folder",
    description:
      "Creates a Google Drive folder. The operation is externally visible to the connected account.",
    inputSchema: z.object({
      name: z.string().trim().min(1).max(255),
      parentId: idSchema.optional()
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("create folder", () =>
        drive.files.create({
          requestBody: {
            name: assertFileName(input.name),
            mimeType: folderMimeType,
            parents: input.parentId ? [input.parentId] : undefined
          },
          fields: fileGetFields,
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-create-file-metadata",
    description: "Creates a Google Drive file resource without content.",
    inputSchema: z.object({
      name: z.string().trim().min(1).max(255),
      mimeType: mimeTypeSchema.optional(),
      parentId: idSchema.optional(),
      description: z.string().max(10000).optional()
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("create file metadata", () =>
        drive.files.create({
          requestBody: {
            name: assertFileName(input.name),
            mimeType: input.mimeType,
            parents: input.parentId ? [input.parentId] : undefined,
            description: input.description
          },
          fields: fileGetFields,
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-update-file",
    description: "Updates supported metadata on a specific Google Drive file or folder.",
    inputSchema: z.object({
      fileId: idSchema,
      name: z.string().trim().min(1).max(255).optional(),
      description: z.string().max(10000).optional(),
      starred: z.boolean().optional(),
      trashed: z.boolean().optional(),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("update file metadata", () =>
        drive.files.update({
          fileId: input.fileId,
          requestBody: {
            name: input.name ? assertFileName(input.name) : undefined,
            description: input.description,
            starred: input.starred,
            trashed: input.trashed
          },
          fields: input.fields ?? fileGetFields,
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-move-file",
    description:
      "Moves a Google Drive file or folder to a target folder. Existing parents are removed by default.",
    inputSchema: z.object({
      fileId: idSchema,
      targetParentId: idSchema,
      removeExistingParents: z.boolean().default(true),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const current = await withGoogleDriveError("inspect file parents", () =>
        drive.files.get({ fileId: input.fileId, fields: "parents", supportsAllDrives: true })
      );
      const response = await withGoogleDriveError("move file", () =>
        drive.files.update({
          fileId: input.fileId,
          addParents: input.targetParentId,
          removeParents: input.removeExistingParents ? current.data.parents?.join(",") : undefined,
          requestBody: {},
          fields: input.fields ?? fileGetFields,
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-copy-file",
    description:
      "Copies a Google Drive file. Google Workspace files are copied through the Drive API copy operation.",
    inputSchema: z.object({
      fileId: idSchema,
      name: z.string().trim().min(1).max(255).optional(),
      parentId: idSchema.optional(),
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("copy file", () =>
        drive.files.copy({
          fileId: input.fileId,
          requestBody: {
            name: input.name ? assertFileName(input.name) : undefined,
            parents: input.parentId ? [input.parentId] : undefined
          },
          fields: input.fields ?? fileGetFields,
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-trash-file",
    description: "Moves a Google Drive file or folder to trash. This is reversible.",
    inputSchema: z.object({ fileId: idSchema, fields: fieldsSchema }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "trash file",
        () =>
          drive.files.update({
            fileId: input.fileId,
            requestBody: { trashed: true },
            fields: input.fields ?? fileGetFields,
            supportsAllDrives: true
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-restore-file",
    description: "Restores a trashed Google Drive file or folder.",
    inputSchema: z.object({ fileId: idSchema, fields: fieldsSchema }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError(
        "restore file",
        () =>
          drive.files.update({
            fileId: input.fileId,
            requestBody: { trashed: false },
            fields: input.fields ?? fileGetFields,
            supportsAllDrives: true
          }),
        { retry: false }
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-delete-file-permanently",
    description:
      "Permanently deletes a Google Drive file or folder. This cannot be undone and requires explicit confirmation.",
    inputSchema: z.object({ fileId: idSchema, confirmPermanentDeletion: z.literal(true) }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      await withGoogleDriveError(
        "permanently delete file",
        () => drive.files.delete({ fileId: input.fileId, supportsAllDrives: true }),
        { retry: false }
      );
      return { result: { deleted: true, fileId: input.fileId } };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-upload-file",
    description: `Uploads bounded base64 file content to Google Drive (maximum ${8} MiB). Content is not read from arbitrary filesystem paths.`,
    inputSchema: z.object({
      name: z.string().trim().min(1).max(255),
      mimeType: mimeTypeSchema,
      contentBase64: z.string().min(4).max(12_000_000),
      parentId: idSchema.optional(),
      description: z.string().max(10000).optional(),
      keepRevisionForever: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const body = decodeBase64(input.contentBase64);
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("upload file", () =>
        drive.files.create({
          requestBody: {
            name: assertFileName(input.name),
            mimeType: input.mimeType,
            parents: input.parentId ? [input.parentId] : undefined,
            description: input.description
          },
          media: { mimeType: input.mimeType, body },
          keepRevisionForever: input.keepRevisionForever,
          fields: fileGetFields,
          supportsAllDrives: true
        })
      );
      return { result: response.data };
    }
  });

  registerGoogleTool(mcp, {
    name: "drive-download-file",
    description:
      "Downloads a bounded Google Drive file as base64. Google Workspace documents must be exported using a supported export MIME type.",
    inputSchema: z.object({
      fileId: idSchema,
      exportMimeType: mimeTypeSchema.optional(),
      revisionId: idSchema.optional(),
      acknowledgeAbuse: z.boolean().default(false)
    }),
    outputSchema: z.object({
      fileId: z.string(),
      mimeType: z.string().optional(),
      contentBase64: z.string(),
      byteLength: z.number().int().nonnegative(),
      exported: z.boolean()
    }),
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const metadata = await withGoogleDriveError("get download metadata", () =>
        drive.files.get({
          fileId: input.fileId,
          fields: "id,name,mimeType",
          supportsAllDrives: true
        })
      );
      const mime = metadata.data.mimeType ?? "application/octet-stream";
      const exported = workspaceMimeTypes.has(mime);
      if (exported && !input.exportMimeType)
        throw new Error("exportMimeType is required for Google Workspace documents.");
      if (!exported && input.exportMimeType)
        throw new Error("exportMimeType is only valid for Google Workspace documents.");
      const response = exported
        ? await withGoogleDriveError("export file", () =>
            drive.files.export(
              { fileId: input.fileId, mimeType: input.exportMimeType! },
              { responseType: "arraybuffer" }
            )
          )
        : input.revisionId
          ? await withGoogleDriveError("download revision", () =>
              drive.revisions.get(
                {
                  fileId: input.fileId,
                  revisionId: input.revisionId,
                  acknowledgeAbuse: input.acknowledgeAbuse,
                  alt: "media"
                },
                { responseType: "arraybuffer" }
              )
            )
          : await withGoogleDriveError("download file", () =>
              drive.files.get(
                {
                  fileId: input.fileId,
                  acknowledgeAbuse: input.acknowledgeAbuse,
                  alt: "media",
                  supportsAllDrives: true
                },
                { responseType: "arraybuffer" }
              )
            );
      const content = await readDownloadBody((response as { data: unknown }).data);
      return {
        fileId: input.fileId,
        mimeType: input.exportMimeType ?? mime,
        contentBase64: content.toString("base64"),
        byteLength: content.byteLength,
        exported
      };
    }
  });
}

async function readDownloadBody(value: unknown): Promise<Buffer> {
  if (Buffer.isBuffer(value)) return ensureDownloadSize(value);
  if (value instanceof ArrayBuffer) return ensureDownloadSize(Buffer.from(value));
  if (typeof value === "string") return ensureDownloadSize(Buffer.from(value));
  if (typeof value === "object" && value !== null && Symbol.asyncIterator in value) {
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of value as AsyncIterable<unknown>) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
      total += buffer.byteLength;
      if (total > 8 * 1024 * 1024)
        throw new Error("Downloaded content exceeds the 8 MiB MCP limit.");
      chunks.push(buffer);
    }
    return Buffer.concat(chunks);
  }
  throw new Error("Google Drive returned an unsupported download body.");
}

function ensureDownloadSize(value: Buffer): Buffer {
  if (value.byteLength > 8 * 1024 * 1024)
    throw new Error("Downloaded content exceeds the 8 MiB MCP limit.");
  return value;
}
