-- AlterTable
ALTER TABLE "Product" ADD COLUMN "costCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN "financeTaxBps" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BusinessExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GEL',
    "incurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "BusinessExpense_incurredAt_idx" ON "BusinessExpense"("incurredAt");
