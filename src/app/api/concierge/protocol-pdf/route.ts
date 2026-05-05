/**
 * B2C: signed-in owner downloads their own consultation PDF.
 * B2B “Premium” ($499/mo) unlimited scans and white-label flows are enforced on `/api/v1/skin/analyze`
 * via `SaasPartner.subscriptionTier`; wire a partner-only PDF route if you need API-key PDF export.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { buildDigitalBeautyPassportPdf } from "@/lib/concierge/protocolPdf";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const userId = session?.user?.id;
  if (!email || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const consultationId = url.searchParams.get("consultationId")?.trim();
  if (!consultationId) {
    return NextResponse.json({ error: "Missing consultationId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.consultation.findFirst({
    where: { id: consultationId, userId: user.id },
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = await buildDigitalBeautyPassportPdf({
    consultationId: row.id,
    createdAt: row.createdAt,
    aiRecommendation: row.aiRecommendation,
    analysisJson: row.analysisResult,
  });

  const filename = `casa-kilice-protocol-${row.id.slice(0, 8)}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });
}
