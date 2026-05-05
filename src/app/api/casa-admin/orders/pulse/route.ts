import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const latest = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, orderNumber: true },
  });

  return NextResponse.json({
    ok: true as const,
    latestId: latest?.id ?? null,
    latestCreatedAt: latest?.createdAt.toISOString() ?? null,
    orderNumber: latest?.orderNumber ?? null,
  });
}
