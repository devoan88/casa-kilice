-- Manual checkout fields (legacy Stripe rows stay unchanged; new columns nullable).

ALTER TABLE "Order" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Order" ADD COLUMN "orderKind" TEXT;
ALTER TABLE "Order" ADD COLUMN "customerFullName" TEXT;
ALTER TABLE "Order" ADD COLUMN "customerPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN "customerEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryZone" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN "lineItemsJson" TEXT;
ALTER TABLE "Order" ADD COLUMN "subtotalCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "shippingCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "discountCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "discountDescription" TEXT;
ALTER TABLE "Order" ADD COLUMN "totalCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "manualPublicToken" TEXT;

CREATE UNIQUE INDEX "Order_manualPublicToken_key" ON "Order"("manualPublicToken");
