import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Stripe API 2025+ exposes period end on subscription items; keep legacy fallback. */
function subscriptionPeriodEndMs(sub: Stripe.Subscription): number {
  const item = sub.items?.data?.[0];
  if (item?.current_period_end) return item.current_period_end * 1000;
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof legacy === "number") return legacy * 1000;
  return Date.now() + 30 * 24 * 60 * 60 * 1000;
}

/** Stripe 2025+ invoices link subscription via `parent.subscription_details`. */
function invoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  const p = inv.parent;
  if (p?.type === "subscription_details" && p.subscription_details?.subscription) {
    const s = p.subscription_details.subscription;
    return typeof s === "string" ? s : s.id;
  }
  const legacy = (inv as unknown as { subscription?: string | { id: string } }).subscription;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object" && "id" in legacy) return legacy.id;
  return null;
}

function tierFromMetadata(t: string | undefined | null): "basic" | "premium" | "none" {
  if (t === "premium") return "premium";
  if (t === "basic") return "basic";
  return "none";
}

async function applyStripeSubscription(sub: Stripe.Subscription) {
  const byMetaId = sub.metadata?.partnerId?.trim()
    ? await prisma.saasPartner.findUnique({ where: { id: sub.metadata.partnerId } })
    : null;
  const partner =
    byMetaId ?? (await prisma.saasPartner.findFirst({ where: { stripeSubscriptionId: sub.id } }));
  if (!partner) return;

  const metaTier = tierFromMetadata(sub.metadata?.tier);
  const resolvedTier: "basic" | "premium" | "none" =
    metaTier !== "none"
      ? metaTier
      : partner.subscriptionTier === "premium"
        ? "premium"
        : partner.subscriptionTier === "basic"
          ? "basic"
          : "none";

  const status = sub.status;
  const periodEnd = new Date(subscriptionPeriodEndMs(sub));

  let apiAccessEnabled = partner.apiAccessEnabled;
  if (status === "active" || status === "trialing") apiAccessEnabled = true;
  if (status === "past_due" || status === "unpaid") apiAccessEnabled = false;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? partner.stripeCustomerId;

  await prisma.saasPartner.update({
    where: { id: partner.id },
    data: {
      stripeSubscriptionId: status === "canceled" ? null : sub.id,
      stripeCustomerId: customerId,
      subscriptionStatus: status,
      subscriptionPeriodEnd: periodEnd,
      subscriptionTier: status === "canceled" ? "none" : resolvedTier === "none" ? partner.subscriptionTier : resolvedTier,
      apiAccessEnabled: status === "canceled" ? true : apiAccessEnabled,
    },
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook not configured." }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.warn("[webhooks/stripe] signature", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.kind === "saas_credits" && session.metadata.partnerId && session.metadata.credits) {
        const partnerId = session.metadata.partnerId;
        const credits = Number.parseInt(session.metadata.credits, 10);
        const amountCents = session.amount_total ?? 0;
        if (Number.isFinite(credits) && credits > 0) {
          await prisma.$transaction(async (tx) => {
            const p = await tx.saasPartner.findUnique({ where: { id: partnerId } });
            if (!p) return;
            const next = p.credits + credits;
            await tx.saasPartner.update({
              where: { id: partnerId },
              data: { credits: next, apiAccessEnabled: true },
            });
            await tx.saasLedgerEntry.create({
              data: {
                partnerId,
                creditsDelta: credits,
                balanceAfter: next,
                amountCents,
                kind: "stripe_checkout",
                description: `Stripe checkout +${credits} credits`,
                stripeSessionId: session.id,
              },
            });
          });
        }
      }

      if (session.metadata?.kind === "saas_subscription" && session.metadata.partnerId && session.mode === "subscription") {
        const partnerId = session.metadata.partnerId;
        const tier = tierFromMetadata(session.metadata.tier);
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (subId && customerId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await prisma.saasPartner.update({
            where: { id: partnerId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: sub.id,
              subscriptionTier: tier === "none" ? "basic" : tier,
              subscriptionStatus: sub.status,
              subscriptionPeriodEnd: new Date(subscriptionPeriodEndMs(sub)),
              subscriptionScansUsed: 0,
              apiAccessEnabled: sub.status === "active" || sub.status === "trialing",
            },
          });
        }
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      await applyStripeSubscription(event.data.object as Stripe.Subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.saasPartner.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          stripeSubscriptionId: null,
          subscriptionTier: "none",
          subscriptionStatus: "canceled",
        },
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      const inv = event.data.object as Stripe.Invoice;
      const sid = invoiceSubscriptionId(inv);
      if (sid && (inv.billing_reason === "subscription_cycle" || inv.billing_reason === "subscription_create")) {
        await prisma.saasPartner.updateMany({
          where: { stripeSubscriptionId: sid },
          data: {
            subscriptionScansUsed: 0,
            apiAccessEnabled: true,
            subscriptionStatus: "active",
          },
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const sid = invoiceSubscriptionId(inv);
      if (sid) {
        await prisma.saasPartner.updateMany({
          where: { stripeSubscriptionId: sid },
          data: {
            subscriptionStatus: "past_due",
            apiAccessEnabled: false,
          },
        });
      }
    }
  } catch (e) {
    console.error("[webhooks/stripe]", e);
    return NextResponse.json({ error: "Webhook handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
