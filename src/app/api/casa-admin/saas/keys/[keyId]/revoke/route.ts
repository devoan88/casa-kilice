import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(_req: Request, ctx: { params: Promise<{ keyId: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { keyId } = await ctx.params;
  await prisma.saasApiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true as const });
}
