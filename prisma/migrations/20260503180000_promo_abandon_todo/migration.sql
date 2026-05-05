-- Promo coupons, abandoned cart snapshots, admin todos (SQLite).

CREATE TABLE "PromoCoupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "PromoCoupon_code_key" ON "PromoCoupon"("code");

CREATE TABLE "AbandonedCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientKey" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "lastSeenAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" DATETIME
);

CREATE UNIQUE INDEX "AbandonedCart_clientKey_key" ON "AbandonedCart"("clientKey");

CREATE TABLE "AdminTodo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "done" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
