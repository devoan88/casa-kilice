-- AlterTable
ALTER TABLE "User" ADD COLUMN "museStatus" TEXT;
ALTER TABLE "User" ADD COLUMN "museDiscountCode15" TEXT;
ALTER TABLE "User" ADD COLUMN "museBirthdayBoxFlag" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "museFreeShipping" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "musePendingCelebration" TEXT;

CREATE UNIQUE INDEX "User_museDiscountCode15_key" ON "User"("museDiscountCode15");
