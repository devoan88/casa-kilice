import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashSaasApiKey } from "@/lib/saas/apiKeyCrypto";
import { signSaasEmbedToken } from "@/lib/saas/embedToken";
import { saasTierRequestsPerMinute } from "@/lib/saas/subscriptionTiers";
import {
  takeV1AnonymousSlot,
  takeV1BadKeySlot,
  takeV1PartnerSlot,
} from "@/lib/saas/v1RateLimit";

export const runtime = "nodejs";

function corsHeaders(): HeadersInit {
  const allow = process.env.SAAS_CORS_ORIGIN?.trim() || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function extractBearer(req: Request): string | null {
  const x = req.headers.get("x-api-key")?.trim();
  if (x) return x;
  const auth = req.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

/** Short-lived token for iframe flows (pass as Bearer to `/api/v1/skin/analyze`). */
export async function POST(req: Request) {
  const keyRaw = extractBearer(req);
  if (!keyRaw || keyRaw.startsWith("ck_embed_")) {
    if (!takeV1AnonymousSlot(req)) {
      return NextResponse.json(
        { error: "Too many unauthenticated requests. Try again in a minute." },
        { status: 429, headers: corsHeaders() },
      );
    }
    return NextResponse.json(
      { error: "Missing API key. Send X-API-Key or Authorization: Bearer <secret key>." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const lookupHash = hashSaasApiKey(keyRaw);
  const apiKey = await prisma.saasApiKey.findFirst({
    where: { lookupHash, revokedAt: null },
    include: { partner: true },
  });
  if (!apiKey) {
    if (!takeV1BadKeySlot(req)) {
      return NextResponse.json({ error: "Too many attempts." }, { status: 429, headers: corsHeaders() });
    }
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401, headers: corsHeaders() });
  }

  const rpm = saasTierRequestsPerMinute(apiKey.partner.subscriptionTier, apiKey.partner.subscriptionStatus);
  if (!takeV1PartnerSlot(apiKey.partner.id, rpm)) {
    return NextResponse.json(
      { error: "Rate limit exceeded for your plan." },
      { status: 429, headers: corsHeaders() },
    );
  }

  if (!apiKey.partner.apiAccessEnabled) {
    return NextResponse.json(
      { error: "API access is not active for this account." },
      { status: 403, headers: corsHeaders() },
    );
  }

  const token = signSaasEmbedToken(apiKey.id, 3600);
  if (!token) {
    return NextResponse.json(
      { error: "Embed tokens are not configured (set SAAS_EMBED_HMAC_SECRET or SKIN_ENGINE_SECRET)." },
      { status: 501, headers: corsHeaders() },
    );
  }

  return NextResponse.json(
    { token, expiresInSeconds: 3600, analyzeUrl: "/api/v1/skin/analyze" },
    { headers: corsHeaders() },
  );
}
