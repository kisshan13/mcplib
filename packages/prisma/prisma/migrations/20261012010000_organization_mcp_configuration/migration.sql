-- CreateEnum
CREATE TYPE "McpConfigurationScope" AS ENUM ('PLATFORM', 'ORGANIZATION');

-- CreateTable
CREATE TABLE "mcp_configuration" (
    "id" TEXT NOT NULL,
    "mcpId" TEXT NOT NULL,
    "scope" "McpConfigurationScope" NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "organizationId" TEXT,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcp_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mcp_configuration_mcpId_scope_idx" ON "mcp_configuration"("mcpId", "scope");

-- CreateIndex
CREATE INDEX "mcp_configuration_organizationId_idx" ON "mcp_configuration"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "mcp_configuration_mcpId_scopeKey_key" ON "mcp_configuration"("mcpId", "scopeKey");

-- AddForeignKey
ALTER TABLE "mcp_configuration" ADD CONSTRAINT "mcp_configuration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
