import type { SecretProviderConfiguration } from "@packages/mcplib-core";
import { ApiError } from "../../lib/error.js";

interface JsonSchemaProperty {
  type?: string | string[];
  enum?: unknown[];
  secret?: boolean;
  writeOnly?: boolean;
  format?: string;
}

interface JsonSchemaObject {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

function getSchema(configuration: SecretProviderConfiguration): JsonSchemaObject {
  const schema = configuration.inputSchema as JsonSchemaObject;

  if (schema.type !== "object") {
    throw new ApiError("The MCP configuration schema is invalid.", 500);
  }

  return schema;
}

function isSecretField(field: JsonSchemaProperty): boolean {
  return field.secret === true || field.writeOnly === true || field.format === "password";
}

function matchesType(value: unknown, type: string | string[] | undefined): boolean {
  if (!type) return true;

  const types = Array.isArray(type) ? type : [type];
  return types.some((candidate) => {
    if (candidate === "null") return value === null;
    if (candidate === "array") return Array.isArray(value);
    if (candidate === "object") {
      return typeof value === "object" && value !== null && !Array.isArray(value);
    }
    if (candidate === "integer") return typeof value === "number" && Number.isInteger(value);
    if (candidate === "number") return typeof value === "number" && Number.isFinite(value);
    if (candidate === "boolean") return typeof value === "boolean";
    if (candidate === "string") return typeof value === "string";
    return true;
  });
}

function isEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assertValidValue(id: string, value: unknown, field: JsonSchemaProperty): void {
  if (!matchesType(value, field.type)) {
    throw new ApiError(`Configuration field '${id}' has an invalid type.`, 422);
  }

  if (field.enum && !field.enum.some((option) => isEqual(option, value))) {
    throw new ApiError(`Configuration field '${id}' has an invalid value.`, 422);
  }
}

export function validateAndSanitizeConfigurationValues(
  configuration: SecretProviderConfiguration,
  values: Record<string, unknown>
): Record<string, unknown> {
  const schema = getSchema(configuration);
  const properties = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const sanitized: Record<string, unknown> = {};

  for (const id of required) {
    const field = properties[id];
    if (field && isSecretField(field)) continue;

    const value = values[id];
    if (value === undefined || (typeof value === "string" && value.trim().length === 0)) {
      throw new ApiError(`Configuration field '${id}' is required.`, 422);
    }
  }

  for (const [id, value] of Object.entries(values)) {
    const field = properties[id];

    if (!field) {
      if (schema.additionalProperties !== true) {
        throw new ApiError(`Configuration field '${id}' is not supported.`, 422);
      }

      sanitized[id] = value;
      continue;
    }

    if (isSecretField(field)) {
      throw new ApiError(
        `Configuration field '${id}' must be provisioned through the secret provider.`,
        422
      );
    }

    assertValidValue(id, value, field);
    sanitized[id] = value;
  }

  return sanitized;
}

export function sanitizeStoredConfigurationValues(
  configuration: SecretProviderConfiguration,
  values: Record<string, unknown>
): Record<string, unknown> {
  const schema = getSchema(configuration);
  const properties = schema.properties ?? {};

  return Object.fromEntries(
    Object.entries(values).filter(([id]) => {
      const field = properties[id];
      return !field || !isSecretField(field);
    })
  );
}
