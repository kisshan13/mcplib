import { type FormEvent, useEffect, useMemo, useState } from "react";
import { API_URL } from "@/config/constants";
import type { McpMetadata } from "@/core-api/types/mcp-registry";
import { useMcpDirectCredentialMutation } from "@/hooks/query/use-mcp-direct-credential-mutation";
import type { McpViewContext } from "./mcp-view-context";

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
  mcpId: string;
  configuration: McpMetadata["secretProviderConfiguration"];
  context: McpViewContext;
  platformOAuthConfigured?: boolean;
  platformOAuthConnected?: boolean;
  credentialConfigured?: boolean;
  platformOAuthChecking?: boolean;
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

export function McpConfigurationForm({
  mcpId,
  configuration,
  context,
  platformOAuthConfigured = false,
  platformOAuthConnected = false,
  credentialConfigured = false,
  platformOAuthChecking = false
}: McpConfigurationFormProps) {
  const schema = configuration?.inputSchema as JsonSchema | undefined;
  const fields = useMemo(() => Object.entries(schema?.properties ?? {}), [schema]);
  const requiredFields = useMemo(() => new Set(schema?.required ?? []), [schema]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [editingDirectCredential, setEditingDirectCredential] = useState(false);
  const saveDirectCredential = useMcpDirectCredentialMutation();

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

  if (context.type === "platform" && configuration.oauth) {
    const oauthReady = platformOAuthConfigured === true;
    const oauthConnected = platformOAuthConnected === true;
    const oauthUnavailable = !oauthReady && !platformOAuthChecking;

    return (
      <section className="space-y-4" aria-label="MCP configuration">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white">Configuration</h3>
          <p className="text-sm leading-6 text-zinc-400">
            This MCP uses the platform&apos;s OAuth application. You do not need to enter client
            credentials.
          </p>
        </div>

        {configuration.oauth.scopes.length > 0 && (
          <p className="text-sm text-zinc-300">
            Scopes:{" "}
            <span className="font-mono text-xs text-zinc-400">
              {configuration.oauth.scopes.join(", ")}
            </span>
          </p>
        )}

        {oauthConnected ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-zinc-300">Connected</span>
            <button
              type="button"
              className="inline-flex items-center justify-center px-3 py-2 font-mono text-xs text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              onClick={() => {
                if (!oauthReady || platformOAuthChecking) return;

                window.location.assign(
                  `${API_URL}/api/v1/mcps/${encodeURIComponent(mcpId)}/oauth/authorize`
                );
              }}
            >
              Reconnect using OAuth
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center bg-white px-3 py-2 font-mono text-xs font-medium text-zinc-950 transition-colors hover:bg-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-60 disabled:hover:bg-zinc-800"
            disabled={!oauthReady || platformOAuthChecking}
            title={oauthUnavailable ? "Platform OAuth is not configured." : undefined}
            onClick={() => {
              if (!oauthReady || platformOAuthChecking) return;

              window.location.assign(
                `${API_URL}/api/v1/mcps/${encodeURIComponent(mcpId)}/oauth/authorize`
              );
            }}
          >
            {oauthUnavailable ? "OAuth unavailable" : "Sign in using OAuth"}
          </button>
        )}

        {oauthUnavailable && (
          <p className="text-xs leading-5 text-zinc-600">
            Platform OAuth is not configured for this MCP yet.
          </p>
        )}
      </section>
    );
  }

  const scopeDescription =
    configuration.type === "configuration"
      ? "This MCP expects configuration before its credential can be provided."
      : "Enter the service credential to make this MCP available to your account.";

  function handleDirectCredentialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTouched = new Set(requiredFields);
    setTouched(nextTouched);

    const hasMissingRequiredField = [...requiredFields].some((id) =>
      isEmptyValue(values[id] ?? "")
    );
    if (hasMissingRequiredField) return;

    saveDirectCredential.mutate({
      id: mcpId,
      context,
      values
    });
  }

  if (configuration.type === "direct" && credentialConfigured && !editingDirectCredential) {
    return (
      <section className="space-y-4" aria-label="MCP configuration">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white">Configuration</h3>
          <p className="text-sm leading-6 text-zinc-400">
            This MCP has a configured service credential.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-zinc-300">Configured</span>
          <button
            type="button"
            className="inline-flex items-center justify-center px-3 py-2 font-mono text-xs text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            onClick={() => {
              saveDirectCredential.reset();
              setEditingDirectCredential(true);
            }}
          >
            Edit configuration
          </button>
        </div>

        <p className="text-xs leading-5 text-zinc-600">
          The stored secret is never returned. Enter a new value to replace it.
        </p>
      </section>
    );
  }

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

      <form onSubmit={configuration.type === "direct" ? handleDirectCredentialSubmit : undefined}>
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

        {configuration.type === "direct" && (
          <div className="mt-5 space-y-3">
            <button
              type="submit"
              disabled={saveDirectCredential.isPending}
              className="inline-flex items-center justify-center bg-white px-3 py-2 font-mono text-xs font-medium text-zinc-950 transition-colors hover:bg-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {saveDirectCredential.isPending ? "Configuring..." : "Configure"}
            </button>

            {saveDirectCredential.isSuccess && (
              <p className="text-xs text-zinc-300" role="status">
                Credential configured securely.
              </p>
            )}
            {saveDirectCredential.isError && (
              <p className="text-xs text-red-300" role="alert">
                We could not configure this credential. Check the value and try again.
              </p>
            )}
          </div>
        )}
      </form>

      <p className="text-xs leading-5 text-zinc-600">
        {configuration.type === "direct"
          ? "Credentials are encrypted before they are stored. Secret values are never returned."
          : "Values are shown for this session only. Stored secrets are never returned by the registry."}
      </p>
    </section>
  );
}
