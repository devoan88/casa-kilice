export type ManualLineItem = {
  slug: string;
  name: string;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type ProductRow = { slug: string; name: string; priceCents: number; currency: string; isActive: boolean };

export function buildManualLineItems(
  items: { slug: string; qty: number }[],
  products: ProductRow[],
): { ok: true; lines: ManualLineItem[]; currency: string } | { ok: false; error: string } {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const lines: ManualLineItem[] = [];
  let currency = "GEL";
  for (const it of items) {
    const p = bySlug.get(it.slug);
    if (!p?.isActive) return { ok: false, error: "One or more products are unavailable." };
    currency = p.currency;
    lines.push({
      slug: it.slug,
      name: p.name,
      qty: it.qty,
      unitPriceCents: p.priceCents,
      lineTotalCents: p.priceCents * it.qty,
    });
  }
  return { ok: true, lines, currency };
}

export function computeManualTotals(
  lines: ManualLineItem[],
  opts: {
    musePercentOff: number;
    freeShipping: boolean;
    shippingCents: number;
    affiliatePercentOff?: number;
    affiliateCode?: string | null;
  },
): {
  subtotalCents: number;
  discountCents: number;
  discountDescription: string | null;
  shippingCents: number;
  totalCents: number;
  /** True when the affiliate promo discount beat or tied Muse and should be stored on the order. */
  affiliatePromoApplied: boolean;
} {
  const subtotalCents = lines.reduce((a, l) => a + l.lineTotalCents, 0);
  const musePct = Math.min(50, Math.max(0, opts.musePercentOff));
  const affPct = Math.min(50, Math.max(0, opts.affiliatePercentOff ?? 0));
  const pct = Math.max(musePct, affPct);
  const discountCents = pct > 0 ? Math.floor((subtotalCents * pct) / 100) : 0;
  const affiliatePromoApplied = affPct >= musePct && affPct > 0 && !!opts.affiliateCode?.trim();
  let discountDescription: string | null = null;
  if (discountCents > 0) {
    if (affiliatePromoApplied) {
      discountDescription = `Promo ${opts.affiliateCode!.trim()} — influencer partner`;
    } else if (musePct > 0) {
      discountDescription = `Muse ${musePct}% — Casa Kilicé creator reward`;
    }
  }
  const shippingCents = opts.freeShipping ? 0 : Math.max(0, opts.shippingCents);
  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);
  return { subtotalCents, discountCents, discountDescription, shippingCents, totalCents, affiliatePromoApplied };
}
