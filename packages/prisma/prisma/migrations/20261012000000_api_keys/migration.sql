-- CreateTable
CREATE TABLE "api_key" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownershipType" "OAuthOwnershipType" NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "verifier" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_mcp_access" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "mcpId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_key_mcp_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_key_prefix_key" ON "api_key"("prefix");
CREATE INDEX "api_key_ownershipType_organizationId_idx" ON "api_key"("ownershipType", "organizationId");
CREATE INDEX "api_key_userId_idx" ON "api_key"("userId");
CREATE INDEX "api_key_expiresAt_idx" ON "api_key"("expiresAt");
CREATE INDEX "api_key_revokedAt_idx" ON "api_key"("revokedAt");
CREATE UNIQUE INDEX "api_key_mcp_access_apiKeyId_mcpId_key" ON "api_key_mcp_access"("apiKeyId", "mcpId");
CREATE INDEX "api_key_mcp_access_mcpId_idx" ON "api_key_mcp_access"("mcpId");

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_key_mcp_access" ADD CONSTRAINT "api_key_mcp_access_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_key"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep the nullable organization ownership field consistent with the ownership enum.
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_scope_organization_check"
  CHECK (("ownershipType" = 'ORGANIZATION' AND "organizationId" IS NOT NULL)
      OR ("ownershipType" = 'PLATFORM' AND "organizationId" IS NULL));
