/** Credits consumed per successful SaaS skin analysis call. */
export function saasCreditsPerAnalysis(): number {
  const n = Number(process.env.SAAS_CREDITS_PER_ANALYSIS ?? "1");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/** Price per credit in tetri (minor GEL) for Stripe Checkout (admin-initiated packs). */
export function saasCreditPriceCents(): number {
  const n = Number(process.env.SAAS_CREDIT_PRICE_CENTS ?? "5");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5;
}
