import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const carts = await prisma.abandonedCart.findMany({
    where: { convertedAt: null },
    orderBy: { lastSeenAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ ok: true as const, carts });
}
