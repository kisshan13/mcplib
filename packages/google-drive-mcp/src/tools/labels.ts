import { McpToolkit } from "@packages/mcp-core";
import { drive_v3 } from "@googleapis/drive";
import { drivelabels_v2 } from "@googleapis/drivelabels";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { labelValueInput, resultSchema } from "../schemas.js";
import { fieldsSchema, idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

const labelView = "LABEL_VIEW_FULL";
const appliedLabelFields =
  "labels(id,revisionId,fields(id,valueType,text,integer,dateString,selection,user(displayName,emailAddress)))";

const fieldModificationInput = z.object({ fieldId: idSchema, values: labelValueInput });

export function registerLabelTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-list-labels",
    description: "Lists Google Drive label definitions through Drive Labels API v2.",
    inputSchema: z.object({
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      publishedOnly: z.boolean().default(true),
      minimumRole: z.enum(["READER", "WRITER", "OWNER"]).default("READER"),
      customer: z.string().trim().max(200).optional(),
      useAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { labels } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list Drive labels", () =>
        labels.labels.list({
          pageSize: Math.min(input.pageSize, 200),
          pageToken: input.pageToken,
          publishedOnly: input.publishedOnly,
          minimumRole: input.minimumRole,
          customer: input.customer,
          useAdminAccess: input.useAdminAccess,
          view: labelView
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-get-label",
    description:
      "Retrieves a Google Drive label definition, including its fields and revision metadata.",
    inputSchema: z.object({
      name: z
        .string()
        .trim()
        .regex(/^labels\/[A-Za-z0-9_]+(?:@(?:latest|published|[A-Za-z0-9_]+))?$/),
      useAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { labels } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("get Drive label", () =>
        labels.labels.get({
          name: input.name,
          useAdminAccess: input.useAdminAccess,
          view: labelView
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-list-label-fields",
    description: "Retrieves and lists the fields defined by a Google Drive label.",
    inputSchema: z.object({
      labelName: z
        .string()
        .trim()
        .regex(/^labels\/[A-Za-z0-9_]+(?:@(?:latest|published|[A-Za-z0-9_]+))?$/),
      useAdminAccess: z.boolean().default(false)
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { labels } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list Drive label fields", () =>
        labels.labels.get({
          name: input.labelName,
          useAdminAccess: input.useAdminAccess,
          view: labelView
        })
      );
      return { result: { label: response.data, fields: response.data.fields ?? [] } };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-list-file-labels",
    description:
      "Lists labels currently applied to a Google Drive file using Drive v3 applied-label operations.",
    inputSchema: z.object({
      fileId: idSchema,
      pageSize: pageSizeSchema,
      pageToken: pageTokenSchema,
      fields: fieldsSchema
    }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("list applied file labels", () =>
        drive.files.listLabels({
          fileId: input.fileId,
          maxResults: Math.min(input.pageSize, 100),
          pageToken: input.pageToken,
          fields: input.fields ?? appliedLabelFields
        })
      );
      return { result: response.data };
    }
  });
  registerGoogleTool(mcp, {
    name: "drive-modify-file-labels",
    description:
      "Applies, updates, or removes Google Drive label values after validating field types against the live label definition.",
    inputSchema: z
      .object({
        fileId: idSchema,
        labelId: idSchema,
        removeLabel: z.boolean().default(false),
        fieldModifications: z.array(fieldModificationInput).max(100).default([]),
        useAdminAccess: z.boolean().default(false)
      })
      .refine((input) => input.removeLabel || input.fieldModifications.length > 0, {
        message: "Provide fieldModifications unless removeLabel is true."
      }),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { drive, labels } = await getGoogleDriveClients(context);
      const definition = await withGoogleDriveError("validate Drive label fields", () =>
        labels.labels.get({
          name: `labels/${input.labelId}`,
          useAdminAccess: input.useAdminAccess,
          view: labelView
        })
      );
      const fields = new Map(
        (definition.data.fields ?? []).flatMap((field) =>
          field.id ? [[field.id, inferFieldType(field)] as const] : []
        )
      );
      for (const modification of input.fieldModifications) {
        const expected = fields.get(modification.fieldId);
        if (!expected)
          throw new Error(
            `Label field '${modification.fieldId}' was not found on label '${input.labelId}'.`
          );
        if (expected !== modification.values.valueType)
          throw new Error(
            `Label field '${modification.fieldId}' expects '${expected}' values, not '${modification.values.valueType}'.`
          );
      }
      const labelModifications: drive_v3.Schema$LabelModification[] = [
        {
          labelId: input.labelId,
          removeLabel: input.removeLabel,
          fieldModifications: input.fieldModifications.map(
            (modification: z.infer<typeof fieldModificationInput>) =>
              toDriveFieldModification(modification)
          )
        }
      ];
      const response = await withGoogleDriveError("modify applied Drive labels", () =>
        drive.files.modifyLabels({ fileId: input.fileId, requestBody: { labelModifications } })
      );
      return { result: response.data };
    }
  });
}

function inferFieldType(
  field: drivelabels_v2.Schema$GoogleAppsDriveLabelsV2Field
): z.infer<typeof labelValueInput>["valueType"] {
  if (field.dateOptions) return "dateString";
  if (field.integerOptions) return "integer";
  if (field.selectionOptions) return "selection";
  if (field.textOptions) return "text";
  if (field.userOptions) return "user";
  throw new Error(`Label field '${field.id ?? "unknown"}' has an unsupported field type.`);
}

function toDriveFieldModification(
  input: z.infer<typeof fieldModificationInput>
): drive_v3.Schema$LabelFieldModification {
  switch (input.values.valueType) {
    case "dateString":
      return { fieldId: input.fieldId, setDateValues: input.values.values };
    case "integer":
      return { fieldId: input.fieldId, setIntegerValues: input.values.values };
    case "selection":
      return { fieldId: input.fieldId, setSelectionValues: input.values.values };
    case "text":
      return { fieldId: input.fieldId, setTextValues: input.values.values };
    case "user":
      return { fieldId: input.fieldId, setUserValues: input.values.values };
  }
}
