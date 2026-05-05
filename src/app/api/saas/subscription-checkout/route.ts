import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  partnerId: z.string().trim().min(1),
  email: z.string().trim().email().max(254),
  tier: z.enum(["basic", "premium"]),
});

function priceIdForTier(tier: "basic" | "premium"): string | null {
  const id =
    tier === "premium"
      ? process.env.STRIPE_PRICE_PREMIUM_MONTHLY?.trim()
      : process.env.STRIPE_PRICE_BASIC_MONTHLY?.trim();
  return id || null;
}

/** Stripe Billing Checkout (subscription). Email must match partner. */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const { partnerId, email, tier } = parsed.data;
  const partner = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!partner || partner.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Unknown partner or email mismatch." }, { status: 404 });
  }

  const priceId = priceIdForTier(tier);
  if (!priceId) {
    return NextResponse.json(
      { error: "Subscription prices are not configured (STRIPE_PRICE_BASIC_MONTHLY / STRIPE_PRICE_PREMIUM_MONTHLY)." },
      { status: 501 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 501 });
  }

  const origin =
    req.headers.get("origin")?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";
  const o = origin.replace(/\/$/, "");
  const successUrl = `${o}/skin-api/success?subscription=1&partnerId=${encodeURIComponent(partnerId)}`;
  const cancelUrl = `${o}/skin-api?cancel=1`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    client_reference_id: partnerId,
    metadata: {
      kind: "saas_subscription",
      partnerId,
      tier,
    },
    subscription_data: {
      metadata: {
        kind: "saas_subscription",
        partnerId,
        tier,
      },
    },
    line_items: [{ price: priceId, quantity: 1 }],
  });

  return NextResponse.json({ url: session.url });
}
