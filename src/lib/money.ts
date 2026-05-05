/**
 * Currency string for UI. Uses a fixed locale so server-rendered HTML matches the browser
 * (ka-GE + GEL can differ between Node and Chrome and causes hydration mismatches).
 */
export function formatMoney(cents: number, currency: string) {
  const value = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

