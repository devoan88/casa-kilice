export type CommerceRates = {
  gelPerUsd: number;
  gelPerEur: number;
  deliveryIntlCents: number;
  deliveryTbilisiCents: number;
  deliveryRegionCents: number;
};

/** Used before `/api/public/commerce` loads and in static catalog fallbacks. Must stay server-free (no Prisma). */
export const staticCommerceFallback: CommerceRates = {
  gelPerUsd: 2.7,
  gelPerEur: 2.9,
  deliveryIntlCents: 4500,
  deliveryTbilisiCents: 500,
  deliveryRegionCents: 1000,
};
