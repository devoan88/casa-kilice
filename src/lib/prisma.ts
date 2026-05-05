import { PrismaClient } from "@/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
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
  const provider = process.env.PRISMA_PROVIDER ?? (process.env.NODE_ENV === "production" ? "postgres" : "sqlite");

  if (provider === "sqlite") {
    const sqliteUrl = url ?? "file:./dev.db";
    const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
    return new PrismaClient({ adapter });
  }

  if (!url) {
    throw new Error("DATABASE_URL is required for Postgres deployments.");
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

function resolvePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const cacheKeyOk = globalForPrisma.__prismaClientCacheKey === PRISMA_CLIENT_CACHE_KEY;
  if (cached && cacheKeyOk && prismaDelegateShapeOk(cached)) {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.__prismaClientCacheKey = PRISMA_CLIENT_CACHE_KEY;
  }
  return client;
}

/**
 * Lazy client: importing this module must not throw when DATABASE_URL is missing (e.g. Vercel
 * install/build before env is applied). First real delegate access creates the client.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = resolvePrismaClient();
    const value = Reflect.get(client, prop) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

