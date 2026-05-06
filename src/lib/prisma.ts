import { PrismaClient } from "@/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  __prismaClientCacheKey?: number;
};

/** Bump when the Prisma schema requires a fresh client (stops stale globalThis clients from rejecting new fields). */
const PRISMA_CLIENT_CACHE_KEY = 7;

/** Append missing libpq-style query params without re-parsing credentials (avoids URL edge cases). */
function ensureConnParam(connectionString: string, key: string, value: string): string {
  const re = new RegExp(`(?:^|[?&])${key}=`, "i");
  if (re.test(connectionString)) return connectionString;
  return connectionString.includes("?")
    ? `${connectionString}&${key}=${value}`
    : `${connectionString}?${key}=${value}`;
}

function normalizePostgresAdapterUrl(raw: string): string {
  let url = raw.trim();
  url = ensureConnParam(url, "sslmode", "require");
  url = ensureConnParam(url, "connect_timeout", "30");
  return url;
}

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
    console.log("DEBUG: Database connecting... (sqlite)");
    try {
      const sqliteUrl = url ?? "file:./dev.db";
      const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
      return new PrismaClient({ adapter });
    } catch (error) {
      console.error("DEBUG ERROR:", error);
      throw error;
    }
  }

  if (!url) {
    const err = new Error("DATABASE_URL is required for Postgres deployments.");
    console.error("DEBUG ERROR:", err);
    throw err;
  }

  console.log("DEBUG: Database connecting... (postgres)", {
    vercel: process.env.VERCEL === "1",
    provider,
    hasUrl: true,
  });

  try {
    const onVercel = process.env.VERCEL === "1";
    if (onVercel) {
      // Pool queries over HTTP avoid WebSocket/TLS issues that can hang or time out on serverless.
      neonConfig.poolQueryViaFetch = true;
    }

    const connectionString = normalizePostgresAdapterUrl(url);
    const adapter = new PrismaNeon(
      {
        connectionString,
        connectionTimeoutMillis: 30_000,
        max: onVercel ? 1 : 10,
        idleTimeoutMillis: onVercel ? 10_000 : 30_000,
        allowExitOnIdle: onVercel,
      },
      {
        onPoolError: (err) => {
          console.error("[prisma] Neon pool error:", err);
          console.error("DEBUG ERROR:", err);
        },
        onConnectionError: (err) => {
          console.error("[prisma] Neon connection error:", err);
          console.error("DEBUG ERROR:", err);
        },
      },
    );
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    throw error;
  }
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

