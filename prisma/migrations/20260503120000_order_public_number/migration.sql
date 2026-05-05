-- Public order numbers for checkout (#CK-1001). Legacy rows stay NULL.

ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
