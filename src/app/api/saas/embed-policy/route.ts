import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Public: which origins may postMessage an API key into the embed widget (optional hardening). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const partnerId = url.searchParams.get("partnerId")?.trim();
  if (!partnerId) {
    return NextResponse.json({ origins: [] as string[] });
  }
  const p = await prisma.saasPartner.findUnique({
    where: { id: partnerId },
    select: { allowedEmbedOrigins: true },
  });
  if (!p?.allowedEmbedOrigins?.trim()) {
    return NextResponse.json({ origins: [] as string[] });
  }
  const origins = p.allowedEmbedOrigins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return NextResponse.json({ origins });
}
