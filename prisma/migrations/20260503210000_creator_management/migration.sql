-- AlterTable
ALTER TABLE "Order" ADD COLUMN "affiliatePromoCode" TEXT;

CREATE INDEX "Order_affiliatePromoCode_idx" ON "Order"("affiliatePromoCode");

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "socialLink" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "platform" TEXT NOT NULL,
    "profileImage" TEXT,
    "collaborationStatus" TEXT NOT NULL DEFAULT 'Active',
    "promoCouponId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Creator_promoCouponId_fkey" FOREIGN KEY ("promoCouponId") REFERENCES "PromoCoupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Creator_promoCouponId_key" ON "Creator"("promoCouponId");

-- CreateTable
CREATE TABLE "CreatorMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreatorMedia_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CreatorMedia_creatorId_idx" ON "CreatorMedia"("creatorId");
