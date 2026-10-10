import { z } from "zod";

export type SecretProviderConfigurationType = "direct" | "configuration";

export type SecretProviderJsonSchema = Record<string, unknown>;

export interface SecretProviderOAuthConfiguration {
  authorizationUrl?: string;
  tokenUrl?: string;
  redirectUri?: string;
  scopes: readonly string[];
}

export type SecretProviderConfigurationOptions =
  | {
      type: "direct";
      secretId: string;
      inputSchema: z.ZodTypeAny;
    }
  | {
      type: "configuration";
      secretId: string;
      inputSchema: z.ZodTypeAny;
      oauth?: SecretProviderOAuthConfiguration;
    };

export class SecretProviderConfiguration {
  readonly type: SecretProviderConfigurationType;
  readonly secretId: string;
  readonly inputSchema: SecretProviderJsonSchema;
  readonly oauth?: SecretProviderOAuthConfiguration;

  constructor(options: SecretProviderConfigurationOptions) {
    if (options.secretId.trim().length === 0) {
      throw new Error("SecretProviderConfiguration requires a secretId");
    }

    const inputSchema = z.toJSONSchema(options.inputSchema) as SecretProviderJsonSchema;

    if (inputSchema.type !== "object") {
      throw new Error("SecretProviderConfiguration inputSchema must describe an object");
    }

    this.type = options.type;
    this.secretId = options.secretId;
    this.inputSchema = cloneJson(inputSchema);
    const oauth = "oauth" in options ? options.oauth : undefined;
    this.oauth = oauth
      ? {
          ...oauth,
          scopes: [...oauth.scopes]
        }
      : undefined;
  }

  clone(): SecretProviderConfiguration {
    return SecretProviderConfiguration.fromJson({
      type: this.type,
      secretId: this.secretId,
      inputSchema: this.inputSchema,
      oauth: this.oauth
    });
  }

  private static fromJson(options: {
    type: SecretProviderConfigurationType;
    secretId: string;
    inputSchema: SecretProviderJsonSchema;
    oauth?: SecretProviderOAuthConfiguration;
  }): SecretProviderConfiguration {
    const configuration = Object.create(
      SecretProviderConfiguration.prototype
    ) as SecretProviderConfiguration;

    Object.assign(configuration, {
      type: options.type,
      secretId: options.secretId,
      inputSchema: cloneJson(options.inputSchema),
      oauth: options.oauth ? { ...options.oauth, scopes: [...options.oauth.scopes] } : undefined
    });

    return configuration;
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
