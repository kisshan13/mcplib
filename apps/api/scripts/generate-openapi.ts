import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createOpenApiDocument } from "../src/openapi/document.js";

const outputPath = resolve(process.cwd(), "openapi.json");
await writeFile(outputPath, `${JSON.stringify(createOpenApiDocument(), null, 2)}\n`);
console.log(`OpenAPI document written to ${outputPath}`);
