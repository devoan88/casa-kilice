import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { saasCreditPriceCents } from "@/lib/saas/creditCost";

export const runtime = "nodejs";

const bodySchema = z.object({
  credits: z.coerce.number().int().min(50).max(500_000),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: partnerId } = await ctx.params;
  const partner = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "credits must be 50–500000" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured (STRIPE_SECRET_KEY)." }, { status: 501 });
  }

  const credits = parsed.data.credits;
  const unit = saasCreditPriceCents();
  const amount = credits * unit;
  if (amount <= 0 || amount > 50_000_000) {
    return NextResponse.json({ error: "Amount out of range." }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const successUrl = `${origin}/casa-admin/saas?paid=1`;
  const cancelUrl = `${origin}/casa-admin/saas?cancel=1`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: partnerId,
    metadata: {
      kind: "saas_credits",
      partnerId,
      credits: String(credits),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gel",
          unit_amount: amount,
          product_data: {
            name: `Casa Kilicé API credits (${credits})`,
            description: "Skin analysis SaaS — credit pack (bank settlement via Stripe; IBAN transfers can be mirrored manually in ledger).",
          },
        },
      },
    ],
  });

  return NextResponse.json({ url: session.url });
}
