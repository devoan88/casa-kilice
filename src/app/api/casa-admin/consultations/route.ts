import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return NextResponse.json({
    consultations: rows.map((c) => ({
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      userEmail: c.user.email,
      userName: c.user.name,
      userPhotoUrl: c.userPhotoUrl,
      primaryProductSlug: c.primaryProductSlug,
      aiRecommendation: c.aiRecommendation,
      analysisResult: c.analysisResult,
    })),
  });
}
