import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Manual credit grant (e.g. after bank transfer to your IBAN). */
const bodySchema = z.object({
  credits: z.coerce.number().int().min(1).max(1_000_000),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: partnerId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { credits, note } = parsed.data;
  const partner = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const next = partner.credits + credits;
  await prisma.$transaction([
    prisma.saasPartner.update({
      where: { id: partnerId },
      data: { credits: next, apiAccessEnabled: true },
    }),
    prisma.saasLedgerEntry.create({
      data: {
        partnerId,
        creditsDelta: credits,
        balanceAfter: next,
        amountCents: null,
        kind: "manual_grant",
        description: note || "Manual credit grant (bank / admin)",
      },
    }),
  ]);

  return NextResponse.json({ ok: true as const, credits: next });
}
