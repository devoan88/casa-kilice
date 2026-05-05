import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import type { ConsultationAnalysisPayload } from "@/lib/skinScan/types";

export const runtime = "nodejs";

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      createdAt: true,
      userPhotoUrl: true,
      primaryProductSlug: true,
      aiRecommendation: true,
      analysisResult: true,
      user: { select: { email: true, name: true } },
    },
  });

  const items = rows.map((c) => {
    let gender: string | null = null;
    let undertone: string | null = null;
    let analysisSource: string | null = null;
    try {
      const a = JSON.parse(c.analysisResult) as Partial<ConsultationAnalysisPayload>;
      gender = a.styling?.genderPresentation ?? null;
      undertone = a.undertone ?? null;
      analysisSource = a.analysisSource ?? null;
    } catch {
      /* ignore */
    }
    return {
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      userEmail: c.user.email,
      userName: c.user.name,
      hasPhoto: Boolean(c.userPhotoUrl),
      primaryProductSlug: c.primaryProductSlug,
      gender,
      undertone,
      analysisSource,
      aiPreview: c.aiRecommendation.slice(0, 220),
    };
  });

  return NextResponse.json(
    { items, serverTime: new Date().toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}
