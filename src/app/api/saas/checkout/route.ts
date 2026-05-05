import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { saasCreditPriceCents } from "@/lib/saas/creditCost";

export const runtime = "nodejs";

const bodySchema = z.object({
  partnerId: z.string().trim().min(1),
  email: z.string().trim().email().max(254),
  credits: z.coerce.number().int().min(50).max(50_000),
});

/**
 * Public Stripe Checkout for a partner created via `/api/saas/lead`.
 * Email must match the partner record to prevent arbitrary top-ups on someone else's id.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const { partnerId, email, credits } = parsed.data;
  const partner = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!partner || partner.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Unknown partner or email mismatch." }, { status: 404 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 501 });
  }

  const unit = saasCreditPriceCents();
  const amount = credits * unit;
  if (amount <= 0 || amount > 50_000_000) {
    return NextResponse.json({ error: "Amount out of range." }, { status: 400 });
  }

  const origin =
    req.headers.get("origin")?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";
  const successUrl = `${origin.replace(/\/$/, "")}/skin-api/success?partnerId=${encodeURIComponent(partnerId)}`;
  const cancelUrl = `${origin.replace(/\/$/, "")}/skin-api?cancel=1`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
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
            name: `Casa Kilicé Skin API — ${credits} credits`,
            description: "B2B skin analysis API credits (Beauty Tech).",
          },
        },
      },
    ],
  });

  return NextResponse.json({ url: session.url });
}
