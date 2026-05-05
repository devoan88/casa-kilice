import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { newWidgetSiteKey } from "@/lib/saas/widgetSiteKey";

export const runtime = "nodejs";

const bodySchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  website: z.string().trim().max(500).optional().or(z.literal("")),
});

/** Public B2B signup — account is inactive until Stripe checkout completes. */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }

  const { companyName, email, website } = parsed.data;
  const partner = await prisma.saasPartner.create({
    data: {
      name: companyName,
      email,
      website: website || null,
      credits: 0,
      apiAccessEnabled: false,
      widgetSiteKey: newWidgetSiteKey(),
      notes: "Self-serve (skin-api landing)",
    },
  });

  return NextResponse.json({ partnerId: partner.id, email: partner.email });
}
