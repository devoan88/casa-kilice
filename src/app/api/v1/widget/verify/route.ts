import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { originMatchesAllowed, parseAllowedOrigins } from "@/lib/saas/widgetDomain";

export const runtime = "nodejs";

function cors(origin: string | null, allowed: boolean): HeadersInit {
  if (!origin || !allowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: cors(origin, !!origin) });
}

/**
 * Browser widget script calls this with `Origin` = the host page.
 * Domain must be listed on the partner (allowedEmbedOrigins).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("k")?.trim();
  const origin = req.headers.get("origin");

  if (!key) {
    return NextResponse.json({ ok: false as const, error: "Missing k." }, { status: 400 });
  }

  const partner = await prisma.saasPartner.findFirst({
    where: { widgetSiteKey: key },
    select: {
      id: true,
      name: true,
      allowedEmbedOrigins: true,
      apiAccessEnabled: true,
    },
  });

  if (!partner) {
    return NextResponse.json(
      { ok: false as const, error: "Unknown site key." },
      { status: 404, headers: cors(origin, false) },
    );
  }

  const allowed = parseAllowedOrigins(partner.allowedEmbedOrigins);
  const ok = originMatchesAllowed(origin, allowed);

  if (!ok) {
    return NextResponse.json(
      {
        ok: false as const,
        error:
          "This domain is not licensed for the Casa Kilicé widget. Add it under allowed origins in your Casa admin / Skin API settings.",
      },
      { status: 403, headers: cors(origin, false) },
    );
  }

  if (!partner.apiAccessEnabled) {
    return NextResponse.json(
      { ok: false as const, error: "API access is not active for this account." },
      { status: 403, headers: cors(origin, true) },
    );
  }

  const base = url.origin;
  return NextResponse.json(
    {
      ok: true as const,
      partnerId: partner.id,
      embedUrl: `${base}/embed/skin-analysis?partnerId=${encodeURIComponent(partner.id)}`,
      brand: "Casa Kilicé AI",
    },
    { headers: cors(origin, true) },
  );
}
