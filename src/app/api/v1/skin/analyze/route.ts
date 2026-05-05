import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashSaasApiKey } from "@/lib/saas/apiKeyCrypto";
import { saasCreditsPerAnalysis } from "@/lib/saas/creditCost";
import { verifySaasEmbedToken } from "@/lib/saas/embedToken";
import {
  isActiveSubscriptionStatus,
  saasBasicMonthlyScanCap,
  saasTierRequestsPerMinute,
} from "@/lib/saas/subscriptionTiers";
import {
  clientIpFromRequest,
  takeV1AnonymousSlot,
  takeV1BadKeySlot,
  takeV1PartnerSlot,
} from "@/lib/saas/v1RateLimit";
import { invokeSkinAnalysisEngine } from "@/lib/skinScan/engineInvoker";

export const runtime = "nodejs";

const MAX_BYTES = 9 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

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

async function resolveApiKeyRow(raw: string) {
  if (raw.startsWith("ck_embed_")) {
    const v = verifySaasEmbedToken(raw);
    if (!v) return null;
    return prisma.saasApiKey.findFirst({
      where: { id: v.apiKeyId, revokedAt: null },
      include: { partner: true },
    });
  }
  const lookupHash = hashSaasApiKey(raw);
  return prisma.saasApiKey.findFirst({
    where: { lookupHash, revokedAt: null },
    include: { partner: true },
  });
}

async function parseImage(req: Request): Promise<
  | { ok: true; photoBuf: Buffer; photoMime: string }
  | { ok: false; status: number; error: string }
> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File) || file.size <= 0) {
      return { ok: false, status: 400, error: "Missing multipart field `image`." };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, status: 400, error: "Image too large (max 9 MB)." };
    }
    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED.has(mime)) {
      return { ok: false, status: 400, error: "Use image/jpeg, image/png, or image/webp." };
    }
    return { ok: true, photoBuf: Buffer.from(await file.arrayBuffer()), photoMime: mime };
  }

  const json = (await req.json().catch(() => null)) as { imageBase64?: string; mimeType?: string } | null;
  if (!json?.imageBase64) {
    return {
      ok: false,
      status: 400,
      error: "Send multipart `image` or JSON { imageBase64, mimeType }.",
    };
  }
  let buf: Buffer;
  try {
    buf = Buffer.from(json.imageBase64, "base64");
  } catch {
    return { ok: false, status: 400, error: "Invalid imageBase64." };
  }
  const mime = (json.mimeType || "image/jpeg").toLowerCase();
  if (!ALLOWED.has(mime)) {
    return { ok: false, status: 400, error: "Invalid mimeType." };
  }
  if (buf.length > MAX_BYTES) {
    return { ok: false, status: 400, error: "Image too large." };
  }
  return { ok: true, photoBuf: buf, photoMime: mime };
}

type BillingKind = "premium_sub" | "basic_sub" | "credits";

export async function POST(req: Request) {
  const keyRaw = extractBearer(req);
  if (!keyRaw) {
    if (!takeV1AnonymousSlot(req)) {
      return NextResponse.json(
        { error: "Too many unauthenticated requests. Try again in a minute." },
        { status: 429, headers: corsHeaders() },
      );
    }
    return NextResponse.json(
      { error: "Missing API key. Send X-API-Key or Authorization: Bearer <key>." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const apiKey = await resolveApiKeyRow(keyRaw);
  if (!apiKey) {
    if (!takeV1BadKeySlot(req)) {
      return NextResponse.json({ error: "Too many attempts." }, { status: 429, headers: corsHeaders() });
    }
    return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401, headers: corsHeaders() });
  }

  const partner = apiKey.partner;
  const rpm = saasTierRequestsPerMinute(partner.subscriptionTier, partner.subscriptionStatus);
  if (!takeV1PartnerSlot(partner.id, rpm)) {
    return NextResponse.json(
      { error: "Rate limit exceeded for your plan. Slow down or upgrade." },
      { status: 429, headers: corsHeaders() },
    );
  }

  if (!partner.apiAccessEnabled) {
    return NextResponse.json(
      {
        error:
          "API access is suspended until payment is confirmed. Complete checkout or contact Casa Kilicé after an IBAN transfer.",
      },
      { status: 403, headers: corsHeaders() },
    );
  }

  let parsed: Awaited<ReturnType<typeof parseImage>>;
  try {
    parsed = await parseImage(req);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400, headers: corsHeaders() });
  }
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status, headers: corsHeaders() });
  }

  const cost = saasCreditsPerAnalysis();
  const cap = saasBasicMonthlyScanCap();
  const subActive = isActiveSubscriptionStatus(partner.subscriptionStatus);

  let billing: BillingKind = "credits";
  if (subActive && partner.subscriptionTier === "premium") {
    billing = "premium_sub";
  } else if (subActive && partner.subscriptionTier === "basic") {
    const reserved = await prisma.saasPartner.updateMany({
      where: {
        id: partner.id,
        subscriptionStatus: { in: ["active", "trialing"] },
        subscriptionTier: "basic",
        subscriptionScansUsed: { lt: cap },
      },
      data: { subscriptionScansUsed: { increment: 1 } },
    });
    if (reserved.count === 1) billing = "basic_sub";
  }

  let partnerAfterCredits = partner.credits;
  if (billing === "credits") {
    const debit = await prisma.saasPartner.updateMany({
      where: { id: partner.id, credits: { gte: cost } },
      data: { credits: { decrement: cost } },
    });
    if (debit.count !== 1) {
      return NextResponse.json(
        {
          error: `Insufficient quota: Basic plan includes ${cap} scans per billing month via subscription, or use prepaid credits. Upgrade to Premium for unlimited scans or purchase a credit pack.`,
        },
        { status: 402, headers: corsHeaders() },
      );
    }
    partnerAfterCredits = partner.credits - cost;
  }

  try {
    const { payload, aiRecommendation, source } = await invokeSkinAnalysisEngine({
      photoBuf: parsed.photoBuf,
      photoMime: parsed.photoMime,
      skinFocus: null,
      mood: null,
    });

    if (billing === "credits") {
      await prisma.saasLedgerEntry.create({
        data: {
          partnerId: partner.id,
          creditsDelta: -cost,
          balanceAfter: partnerAfterCredits,
          kind: "api_consumption",
          description: "POST /api/v1/skin/analyze",
        },
      });
    } else if (billing === "basic_sub") {
      await prisma.saasLedgerEntry.create({
        data: {
          partnerId: partner.id,
          creditsDelta: 0,
          balanceAfter: partner.credits,
          kind: "subscription_scan",
          description: `POST /api/v1/skin/analyze (Basic subscription, cap ${cap}/period)`,
        },
      });
    }

    await prisma.saasApiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return NextResponse.json(
      {
        undertone: payload.undertone,
        depth: payload.depth,
        primaryProductSlug: payload.primaryProductSlug,
        productNames: payload.productNames,
        routineHints: payload.routineHints,
        aiRecommendation,
        analysisSource: source,
        wellness: payload.wellness,
        styling: payload.styling,
        medicalDisclaimerKa: payload.medicalDisclaimerKa,
        medicalDisclaimerEn: payload.medicalDisclaimerEn,
        billing,
      },
      { headers: corsHeaders() },
    );
  } catch (e) {
    console.error("[saas/v1/skin/analyze]", e, { billing, clientIp: clientIpFromRequest(req) });
    if (billing === "credits") {
      await prisma.$transaction([
        prisma.saasPartner.update({
          where: { id: partner.id },
          data: { credits: { increment: cost } },
        }),
        prisma.saasLedgerEntry.create({
          data: {
            partnerId: partner.id,
            creditsDelta: cost,
            balanceAfter: partner.credits,
            kind: "api_refund",
            description: "Analysis error — credits restored",
          },
        }),
      ]);
    } else if (billing === "basic_sub") {
      await prisma.saasPartner.updateMany({
        where: { id: partner.id, subscriptionScansUsed: { gt: 0 } },
        data: { subscriptionScansUsed: { decrement: 1 } },
      });
    }
    return NextResponse.json({ error: "Analysis failed." }, { status: 500, headers: corsHeaders() });
  }
}
