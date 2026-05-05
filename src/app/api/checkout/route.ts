import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCatalog } from "@/lib/ensureCatalog";
import { getStripe } from "@/lib/stripe";
import { shippingCentsForZone } from "@/lib/shipping";
import type { DeliveryZone } from "@/lib/shipping";
import { getCommerceRates } from "@/lib/siteCommerce";

const schema = z.object({
  slug: z.string().min(1),
  zone: z.enum(["intl", "ge_tbilisi", "ge_region"]).optional().default("intl"),
  qty: z.coerce.number().int().min(1).max(20).optional().default(1),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const authSession = await getServerSession(authOptions);
  const sessionUser =
    authSession?.user?.email != null
      ? await prisma.user.findUnique({
          where: { email: authSession.user.email },
          select: { id: true },
        })
      : null;

  await ensureCatalog();
  const product = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const zone = parsed.data.zone as DeliveryZone;
  const qty = parsed.data.qty;
  const commerce = await getCommerceRates();
  const shippingCents = shippingCentsForZone(zone, commerce);
  const shippingLabel =
    zone === "ge_tbilisi"
      ? "Delivery — Tbilisi (flat rate)"
      : zone === "ge_region"
        ? "Delivery — Georgia regions (flat rate)"
        : "Premium insured delivery — DHL / FedEx / Aramex";
  const shippingDescription =
    "Fully insured · Temperature-controlled signature packaging";

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env to enable real payments.",
      },
      { status: 501 },
    );
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const successUrl = `${origin}/shop/success`;
  const cancelUrl = `${origin}/shop/${product.slug}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    line_items: [
      {
        quantity: qty,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            description: product.description,
            images: product.imageUrl ? [product.imageUrl] : undefined,
          },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: shippingCents,
          product_data: {
            name: shippingLabel,
            description: shippingDescription,
          },
        },
      },
    ],
  });

  await prisma.order.create({
    data: {
      userId: sessionUser?.id,
      productId: product.id,
      productName: product.name,
      priceCents: product.priceCents,
      currency: product.currency,
      stripeSessionId: session.id,
      status: "created",
    },
  });

  return NextResponse.json({ ok: true, url: session.url });
}

