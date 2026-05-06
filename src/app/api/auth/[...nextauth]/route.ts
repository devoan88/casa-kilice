import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Emergency fallback: prevent hard crash when env is missing/mis-set.
// This keeps the app booting so you can still reach the landing page.
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://casa.kilice.vercel.app";
}
if (!process.env.NEXTAUTH_SECRET) {
  const g = globalThis as unknown as { __nextAuthEmergencySecret?: string };
  g.__nextAuthEmergencySecret ??= crypto.randomBytes(32).toString("hex");
  process.env.NEXTAUTH_SECRET = g.__nextAuthEmergencySecret;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

