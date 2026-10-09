import {
  SecretProviderError,
  type Secret,
  type SecretProvider,
  type SecretRequest
} from "@packages/mcplib-core";
import { Prisma, type ServiceToken } from "@packages/prisma";

export type SecretDecryptor = (encryptedValue: string) => Promise<string>;

export interface DatabaseSecretProviderOptions {
  decrypt: SecretDecryptor;
  findToken?: (
    where: Prisma.ServiceTokenWhereInput
  ) => Promise<Pick<ServiceToken, "accessTokenEncrypted"> | null>;
}

/**
 * The API owns authorization and storage lookup. Decryption is injected so
 * the repository's future KMS/encryption integration remains outside the MCP
 * packages and no plaintext fallback is introduced here.
 */
export function createDatabaseSecretProvider(
  options: DatabaseSecretProviderOptions
): SecretProvider {
  const findToken =
    options.findToken ??
    (async (where: Prisma.ServiceTokenWhereInput) => {
      const { default: prisma } = await import("./prisma.js");
      return prisma.serviceToken.findFirst({
        where,
        select: { accessTokenEncrypted: true }
      });
    });

  return {
    async getSecret(request: SecretRequest): Promise<Secret> {
      const accessScopes: Prisma.ServiceTokenWhereInput[] = [];

      if (request.userId) {
        accessScopes.push({
          ownershipType: "PLATFORM",
          ownerType: "PLATFORM_USER",
          organizationId: null,
          userId: request.userId
        });

        if (request.organizationId) {
          accessScopes.push({
            ownershipType: "ORGANIZATION",
            ownerType: "ORGANIZATION_USER",
            organizationId: request.organizationId,
            userId: request.userId
          });
        }
      }

      if (request.organizationId && request.externalUserIdentity) {
        accessScopes.push({
          ownershipType: "ORGANIZATION",
          ownerType: "EXTERNAL_IDENTITY",
          organizationId: request.organizationId,
          externalUserIdentity: request.externalUserIdentity
        });
      }

      if (accessScopes.length === 0) {
        throw new SecretProviderError(
          "A user or organization context is required to access a secret.",
          "ACCESS_DENIED"
        );
      }

      const token = await findToken({
        secretId: request.secretId,
        integrationId: request.integrationId,
        ...(request.serviceProvider ? { serviceProvider: request.serviceProvider } : {}),
        status: "ACTIVE",
        AND: [
          { OR: accessScopes },
          {
            OR: [{ accessTokenExpiresAt: null }, { accessTokenExpiresAt: { gt: new Date() } }]
          }
        ]
      });

      if (!token) {
        throw new SecretProviderError("Requested secret was not found.", "NOT_FOUND");
      }

      if (!token.accessTokenEncrypted) {
        throw new SecretProviderError(
          "Requested secret has no usable access credential.",
          "UNAVAILABLE"
        );
      }

      return {
        type: "header",
        secretType: "bearer",
        name: "Authorization",
        value: `Bearer ${await options.decrypt(token.accessTokenEncrypted)}`
      };
    }
  };
}

/**
 * Placeholder until the platform's approved encryption/KMS implementation is
 * selected. Encrypted database values are never treated as plaintext.
 */
export async function decryptStoredSecret(_encryptedValue: string): Promise<string> {
  throw new SecretProviderError(
    "Secret decryption is not configured for this deployment.",
    "UNAVAILABLE"
  );
}

export const databaseSecretProvider = createDatabaseSecretProvider({
  decrypt: decryptStoredSecret
});
