import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  __prismaClientCacheKey?: number;
};

/** Bump when the Prisma schema requires a fresh client (stops stale globalThis clients from rejecting new fields). */
const PRISMA_CLIENT_CACHE_KEY = 7;

function prismaDelegateShapeOk(client: PrismaClient): boolean {
  const p = client as unknown as {
    siteContent?: { findUnique?: unknown };
    promoCoupon?: { findMany?: unknown };
    businessExpense?: { findMany?: unknown };
    creator?: { findMany?: unknown };
  };
  return (
    typeof p.siteContent?.findUnique === "function" &&
    typeof p.promoCoupon?.findMany === "function" &&
    typeof p.businessExpense?.findMany === "function" &&
    typeof p.creator?.findMany === "function"
  );
}

/**
 * After `prisma generate`, the dev server can still hold an older PrismaClient on `globalThis`
 * without new models or fields. Recreate when delegates are missing or the cache key mismatches.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

const cached = globalForPrisma.prisma;
const cacheKeyOk = globalForPrisma.__prismaClientCacheKey === PRISMA_CLIENT_CACHE_KEY;
export const prisma =
  cached && cacheKeyOk && prismaDelegateShapeOk(cached) ? cached : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.__prismaClientCacheKey = PRISMA_CLIENT_CACHE_KEY;
}

