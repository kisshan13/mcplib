import { SecretProviderError, unavailableSecretProvider } from "./secret-provider.js";
import { SecretProviderConfiguration } from "./secret-provider-configuration.js";
import type {
  Secret,
  SecretAccessContext,
  SecretOperation,
  SecretRequest,
  SecretProvider
} from "./secret-provider.js";
import type {
  SecretProviderConfigurationOptions,
  SecretProviderConfigurationType,
  SecretProviderJsonSchema,
  SecretProviderOAuthConfiguration
} from "./secret-provider-configuration.js";

export { SecretProviderConfiguration, SecretProviderError, unavailableSecretProvider };
export type {
  Secret,
  SecretAccessContext,
  SecretOperation,
  SecretRequest,
  SecretProvider,
  SecretProviderConfigurationOptions,
  SecretProviderConfigurationType,
  SecretProviderJsonSchema,
  SecretProviderOAuthConfiguration
};
