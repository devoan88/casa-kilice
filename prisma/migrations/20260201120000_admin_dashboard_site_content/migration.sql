-- AlterTable
ALTER TABLE "Product" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'General';

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "homeHeroMainText" TEXT,
    "homeHeroSubText" TEXT,
    "homeHeroImageUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
