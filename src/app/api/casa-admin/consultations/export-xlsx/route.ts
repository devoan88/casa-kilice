import { NextResponse } from "next/server";

import * as XLSX from "xlsx";

import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";
import type { ConsultationAnalysisPayload } from "@/lib/skinScan/types";

export const runtime = "nodejs";

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function GET() {
  await requireCasaAdmin();

  const rows = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000,
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

  const data = rows.map((c) => {
    const parsed = safeJsonParse<Partial<ConsultationAnalysisPayload>>(c.analysisResult);
    const gender = parsed?.styling?.genderPresentation ?? null;
    const undertone = parsed?.undertone ?? null;
    const depth = parsed?.depth ?? null;
    const analysisSource = (parsed as { analysisSource?: string } | null)?.analysisSource ?? null;

    return {
      consultationId: c.id,
      createdAt: c.createdAt.toISOString(),
      userEmail: c.user.email,
      userName: c.user.name,
      photoUrl: c.userPhotoUrl,
      gender,
      undertone,
      depth,
      primaryProductSlug: c.primaryProductSlug,
      analysisSource,
      aiRecommendation: c.aiRecommendation,
      analysisJson: c.analysisResult,
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SkinScans");

  // XLSX writes a Buffer in node
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const fileName = `casa-kilice-skin-scans-${new Date().toISOString().slice(0, 10)}.xlsx`;

  // NextResponse expects Web BodyInit — convert Buffer to Uint8Array
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename=\"${fileName}\"`,
      "cache-control": "no-store",
    },
  });
}

