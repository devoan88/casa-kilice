/**
 * Approximate reference FX for labels only (no live API).
 * `gelPerUsd` / `gelPerEur` = how many GEL one USD / one EUR costs (e.g. 2.7 and 2.9).
 */
export function formatApproxMultiCurrencyFromGelCents(
  priceCents: number,
  gelPerUsd: number,
  gelPerEur: number,
): string {
  const gel = priceCents / 100;
  const gelWhole = Math.round(gel);
  const usd = Math.round(gel / gelPerUsd);
  const eur = Math.round(gel / gelPerEur);
  return `${gelWhole} ₾ / $${usd} / €${eur}`;
}
