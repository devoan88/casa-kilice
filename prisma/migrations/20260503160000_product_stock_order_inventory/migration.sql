-- Product stock + idempotent inventory flag on orders (SQLite).

ALTER TABLE "Product" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 100;

ALTER TABLE "Order" ADD COLUMN "inventoryDeducted" INTEGER NOT NULL DEFAULT 0;
