export type Currency = "GEL" | "EUR" | "USD";

/** @deprecated Use `getCommerceRates` + `formatApproxMultiCurrencyFromGelCents` for display. */
export function convertFromGel(amountGel: number, to: Currency, gelPerUsd = 2.7, gelPerEur = 2.9) {
  if (to === "GEL") return amountGel;
  if (to === "EUR") return amountGel / gelPerEur;
  return amountGel / gelPerUsd;
}
