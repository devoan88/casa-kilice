import { randomBytes } from "node:crypto";

import { ensureCatalog } from "@/lib/ensureCatalog";
import { buildManualLineItems, computeManualTotals, type ManualLineItem } from "@/lib/manualOrder";
import { parsePublicOrderSequence } from "@/lib/orderPublicNumber";
import { prisma } from "@/lib/prisma";

export async function persistManualCheckoutOrder(input: {
  items: { slug: string; qty: number }[];
  fullName: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: "cod" | "bank_transfer";
  userId: string | null;
  musePercentOff: number;
  applyMuseDiscount: boolean;
  orderKind: string;
  /** Optional marketing / creator promo code (validated against `PromoCoupon`). */
  promoCode?: string | null;
}): Promise<
  | {
      ok: true;
      order: {
        id: string;
        currency: string;
        totalCents: number | null;
        paymentMethod: string | null;
        orderNumber: string | null;
      };
      token: string;
      lines: ManualLineItem[];
    }
  | { ok: false; error: string }
> {
  const merged = new Map<string, number>();
  for (const it of input.items) {
    merged.set(it.slug, (merged.get(it.slug) ?? 0) + it.qty);
  }
  const items = [...merged.entries()].map(([slug, qty]) => ({ slug, qty }));

  await ensureCatalog();
  const slugs = [...new Set(items.map((i) => i.slug))];
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
  });

  const built = buildManualLineItems(items, products);
  if (!built.ok) return built;

  let affiliatePercentOff = 0;
  let affiliateCodeLabel: string | null = null;
  const rawPromo = input.promoCode?.trim();
  if (rawPromo) {
    const code = rawPromo.toUpperCase();
    const coupon = await prisma.promoCoupon.findUnique({ where: { code } });
    if (!coupon?.isActive) {
      return { ok: false as const, error: "Invalid or inactive promo code." };
    }
    if (coupon.expiresAt.getTime() < Date.now()) {
      return { ok: false as const, error: "This promo code has expired." };
    }
    affiliatePercentOff = coupon.percentOff;
    affiliateCodeLabel = coupon.code;
  }

  const totals = computeManualTotals(built.lines, {
    musePercentOff: input.applyMuseDiscount ? input.musePercentOff : 0,
    freeShipping: true,
    shippingCents: 0,
    affiliatePercentOff,
    affiliateCode: affiliateCodeLabel,
  });

  const affiliatePromoCode =
    totals.affiliatePromoApplied && affiliateCodeLabel ? affiliateCodeLabel.toUpperCase() : null;

  const summaryName =
    built.lines.length === 1
      ? `${built.lines[0]!.name} ×${built.lines[0]!.qty}`
      : `Casa Kilicé — ${built.lines.length} lines`;

  // One public sequence (stored as CK-1001, shown as #CK-1001) for every manual checkout.
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findMany({
      where: { orderNumber: { not: null } },
      select: { orderNumber: true },
    });
    let maxSeq = 1000;
    for (const row of existing) {
      const seq = parsePublicOrderSequence(row.orderNumber);
      if (seq != null) maxSeq = Math.max(maxSeq, seq);
    }
    const nextSeq = Math.max(1001, maxSeq + 1);
    const orderNumber = `CK-${nextSeq}`;
    const manualPublicToken = randomBytes(24).toString("hex");

    return tx.order.create({
      data: {
        userId: input.userId,
        productId: products[0]?.id ?? null,
        productName: summaryName,
        priceCents: totals.totalCents,
        currency: built.currency,
        status: "Pending",
        orderKind: input.orderKind,
        customerFullName: input.fullName,
        customerPhone: input.phone,
        customerEmail: input.email,
        deliveryAddress: input.address,
        deliveryZone: null,
        paymentMethod: input.paymentMethod,
        lineItemsJson: JSON.stringify(built.lines),
        subtotalCents: totals.subtotalCents,
        shippingCents: 0,
        discountCents: totals.discountCents,
        discountDescription: totals.discountDescription,
        totalCents: totals.totalCents,
        affiliatePromoCode,
        manualPublicToken,
        orderNumber,
      },
      select: {
        id: true,
        currency: true,
        totalCents: true,
        paymentMethod: true,
        orderNumber: true,
        manualPublicToken: true,
      },
    });
  });

  const token = order.manualPublicToken;
  if (!token) {
    return { ok: false as const, error: "Order could not be finalized. Please try again." };
  }

  return {
    ok: true,
    order: {
      id: order.id,
      currency: order.currency,
      totalCents: order.totalCents,
      paymentMethod: order.paymentMethod,
      orderNumber: order.orderNumber,
    },
    token,
    lines: built.lines,
  };
}
