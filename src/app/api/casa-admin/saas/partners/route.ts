import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { newWidgetSiteKey } from "@/lib/saas/widgetSiteKey";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  website: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [partners, revenueAgg, soldCredits] = await Promise.all([
    prisma.saasPartner.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        keys: { select: { id: true, keyPrefix: true, revokedAt: true, lastUsedAt: true, createdAt: true } },
      },
    }),
    prisma.saasLedgerEntry.aggregate({
      where: { amountCents: { not: null } },
      _sum: { amountCents: true },
    }),
    prisma.saasLedgerEntry.aggregate({
      where: { kind: "stripe_checkout" },
      _sum: { creditsDelta: true },
    }),
  ]);

  return NextResponse.json({
    partners,
    earningsCents: revenueAgg._sum.amountCents ?? 0,
    creditsSoldViaStripe: soldCredits._sum.creditsDelta ?? 0,
  });
}

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { name, email, website, notes } = parsed.data;
  const partner = await prisma.saasPartner.create({
    data: {
      name,
      email,
      website: website || null,
      notes: notes || null,
      apiAccessEnabled: true,
      widgetSiteKey: newWidgetSiteKey(),
    },
  });

  return NextResponse.json({ partner });
}
