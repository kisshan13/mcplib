import { useEffect, useMemo, useState } from "react";
import type { McpMetadata } from "@/core-api/types/mcp-registry";

type SecretProviderConfiguration = NonNullable<McpMetadata["secretProviderConfiguration"]>;
type JsonSchema = SecretProviderConfiguration["inputSchema"] & {
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
};

type JsonSchemaProperty = {
  type?: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: string;
  secret?: boolean;
  writeOnly?: boolean;
};

interface McpConfigurationFormProps {
  configuration: McpMetadata["secretProviderConfiguration"];
}

function getFieldLabel(id: string, field: JsonSchemaProperty) {
  if (field.title) return field.title;
  return id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function isSecretField(field: JsonSchemaProperty) {
  return field.secret === true || field.writeOnly === true || field.format === "password";
}

function initialValue(field: JsonSchemaProperty) {
  if (field.default === undefined) return field.type === "boolean" ? false : "";
  if (field.type === "boolean") return Boolean(field.default);
  return String(field.default);
}

function isEmptyValue(value: string | boolean) {
  return typeof value === "string" && value.trim().length === 0;
}

export function McpConfigurationForm({ configuration }: McpConfigurationFormProps) {
  const schema = configuration?.inputSchema as JsonSchema | undefined;
  const fields = useMemo(() => Object.entries(schema?.properties ?? {}), [schema]);
  const requiredFields = useMemo(() => new Set(schema?.required ?? []), [schema]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  useEffect(() => {
    setValues(
      Object.fromEntries(fields.map(([id, field]) => [id, initialValue(field)])) as Record<
        string,
        string | boolean
      >
    );
    setTouched(new Set());
  }, [fields]);

  if (!configuration) {
    return (
      <section className="space-y-2" aria-label="MCP configuration">
        <h3 className="text-sm font-medium text-white">Configuration</h3>
        <p className="text-sm leading-6 text-zinc-400">
          This MCP does not require additional configuration.
        </p>
      </section>
    );
  }

  const scopeDescription =
    configuration.type === "configuration"
      ? "This MCP expects configuration before its credential can be provided."
      : "This MCP can receive its credential directly from the secret provider.";

  return (
    <section className="space-y-4" aria-label="MCP configuration">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-white">Configuration</h3>
        <p className="text-sm leading-6 text-zinc-400">{scopeDescription}</p>
      </div>

      {configuration.oauth && (
        <div className="space-y-2 bg-zinc-950/70 p-3">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
            OAuth requirements
          </p>
          {configuration.oauth.scopes.length > 0 && (
            <p className="text-sm text-zinc-300">
              Scopes:{" "}
              <span className="font-mono text-xs text-zinc-400">
                {configuration.oauth.scopes.join(", ")}
              </span>
            </p>
          )}
        </div>
      )}

      {fields.length === 0 ? (
        <p className="text-sm text-zinc-400">No additional values are required.</p>
      ) : (
        <div className="space-y-4">
          {fields.map(([id, field]) => {
            const value = values[id] ?? initialValue(field);
            const required = requiredFields.has(id);
            const error = required && touched.has(id) && isEmptyValue(value);
            const inputId = `mcp-config-${configuration.secretId}-${id}`;

            return (
              <div key={id} className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-200" htmlFor={inputId}>
                  {getFieldLabel(id, field)}
                  {required ? <span className="ml-1 text-zinc-500">*</span> : null}
                </label>
                {field.description && (
                  <p className="text-xs leading-5 text-zinc-500">{field.description}</p>
                )}
                {field.enum ? (
                  <select
                    id={inputId}
                    className="block w-full rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-white"
                    value={String(value)}
                    aria-invalid={error || undefined}
                    onBlur={() => setTouched((current) => new Set(current).add(id))}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [id]: event.target.value }))
                    }
                  >
                    <option value="">Select an option</option>
                    {field.enum.map((option) => (
                      <option key={String(option)} value={String(option)}>
                        {String(option)}
                      </option>
                    ))}
                  </select>
                ) : field.type === "boolean" ? (
                  <label
                    className="flex items-center gap-2 text-sm text-zinc-300"
                    htmlFor={inputId}
                  >
                    <input
                      id={inputId}
                      className="size-4 accent-white"
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [id]: event.target.checked }))
                      }
                    />
                    <span>Use this setting</span>
                  </label>
                ) : (
                  <input
                    id={inputId}
                    className="block w-full rounded-md bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-600 focus:ring-2 focus:ring-white"
                    type={
                      isSecretField(field)
                        ? "password"
                        : field.type === "number"
                          ? "number"
                          : "text"
                    }
                    value={String(value)}
                    aria-invalid={error || undefined}
                    autoComplete={isSecretField(field) ? "off" : undefined}
                    onBlur={() => setTouched((current) => new Set(current).add(id))}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [id]: event.target.value }))
                    }
                  />
                )}
                {error && (
                  <p className="text-xs text-red-300" role="alert">
                    This field is required.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs leading-5 text-zinc-600">
        Values are shown for this session only. Stored secrets are never returned by the registry.
      </p>
    </section>
  );
}
