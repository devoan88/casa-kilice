-- AlterTable
ALTER TABLE "User" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "birthDate" DATETIME;
ALTER TABLE "User" ADD COLUMN "socialHandle" TEXT;
ALTER TABLE "User" ADD COLUMN "museMarketingConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "museMarketingConsentAt" DATETIME;

-- CreateTable
CREATE TABLE "MuseContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    CONSTRAINT "MuseContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MuseContent_userId_idx" ON "MuseContent"("userId");
