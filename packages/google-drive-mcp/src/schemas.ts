import { z } from "zod";
import {
  dateTimeSchema,
  emailSchema,
  fieldsSchema,
  idSchema,
  pageSizeSchema,
  pageTokenSchema,
  resultSchema
} from "./validation.js";

export { resultSchema };

export const filePageInput = z.object({
  pageSize: pageSizeSchema,
  pageToken: pageTokenSchema,
  fields: fieldsSchema,
  driveId: idSchema.optional()
});

export const permissionInput = z.object({
  type: z.enum(["user", "group", "domain", "anyone"]),
  role: z.enum(["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"]),
  emailAddress: emailSchema.optional(),
  domain: z.string().trim().min(1).max(253).optional(),
  allowFileDiscovery: z.boolean().optional(),
  expirationTime: dateTimeSchema.optional()
});

export const labelValueInput = z.discriminatedUnion("valueType", [
  z.object({
    valueType: z.literal("dateString"),
    values: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(100)
  }),
  z.object({
    valueType: z.literal("integer"),
    values: z.array(z.number().int().safe().transform(String)).max(100)
  }),
  z.object({ valueType: z.literal("selection"), values: z.array(idSchema).max(100) }),
  z.object({ valueType: z.literal("text"), values: z.array(z.string().max(10000)).max(100) }),
  z.object({ valueType: z.literal("user"), values: z.array(emailSchema).max(100) })
]);
