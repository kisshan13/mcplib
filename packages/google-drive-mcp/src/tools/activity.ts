import { McpToolkit } from "@packages/mcp-core";
import { z } from "zod";
import { registerGoogleTool } from "./register.js";
import { getGoogleDriveClients } from "../client.js";
import { withGoogleDriveError } from "../errors.js";
import { resultSchema } from "../schemas.js";
import { idSchema, pageSizeSchema, pageTokenSchema } from "../validation.js";

export function registerActivityTools(mcp: McpToolkit): void {
  registerGoogleTool(mcp, {
    name: "drive-query-activity",
    description:
      "Queries Google Drive Activity v2 for one file, folder, or Drive ancestor. Activity is historical and is not a complete audit log.",
    inputSchema: z
      .object({
        itemName: idSchema.optional(),
        ancestorName: idSchema.optional(),
        filter: z.string().trim().max(2000).optional(),
        pageSize: pageSizeSchema,
        pageToken: pageTokenSchema
      })
      .refine((input) => Boolean(input.itemName) !== Boolean(input.ancestorName), {
        message: "Exactly one of itemName or ancestorName is required."
      })
      .refine(
        (input) =>
          !input.filter ||
          /^(?:-?)(?:time|detail\.action_detail_case)\s*(?:<=|>=|=|<|>|:)\s*/.test(input.filter),
        {
          message:
            "Drive Activity filters support time and detail.action_detail_case expressions only."
        }
      ),
    outputSchema: resultSchema,
    async execute(input, context) {
      const { activity } = await getGoogleDriveClients(context);
      const response = await withGoogleDriveError("query Drive Activity", () =>
        activity.activity.query({
          requestBody: {
            itemName: input.itemName ? `items/${input.itemName}` : undefined,
            ancestorName: input.ancestorName ? `items/${input.ancestorName}` : undefined,
            filter: input.filter,
            pageSize: Math.min(input.pageSize, 1000),
            pageToken: input.pageToken
          }
        })
      );
      return { result: response.data };
    }
  });
}
