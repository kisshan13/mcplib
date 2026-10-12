-- AlterEnum
ALTER TYPE "TokenOwnerType" ADD VALUE 'ORGANIZATION_PROFILE';

-- AlterTable
ALTER TABLE "service_token" ADD COLUMN     "profileId" TEXT;

-- AlterTable
ALTER TABLE "api_key" ADD COLUMN     "profileId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePicUrl" TEXT,
    "email" TEXT,
    "metadata" JSONB,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_organizationId_idx" ON "profile"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "profile_organizationId_providerId_key" ON "profile"("organizationId", "providerId");

-- CreateIndex
CREATE INDEX "service_token_profileId_idx" ON "service_token"("profileId");

-- CreateIndex
CREATE INDEX "api_key_profileId_idx" ON "api_key"("profileId");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_token" ADD CONSTRAINT "service_token_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
