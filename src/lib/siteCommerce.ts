import { staticCommerceFallback, type CommerceRates } from "@/lib/commerceConstants";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_ID } from "@/lib/siteContent";

export type { CommerceRates };

function minorToMajor(minor: number | null | undefined, fallbackMajor: number) {
  if (minor == null) return fallbackMajor;
  return minor / 100;
}

/** Site-wide FX display + delivery fees (edited under /casa-admin/content). Server-only. */
export async function getCommerceRates(): Promise<CommerceRates> {
  const row = await prisma.siteContent.findUnique({
    where: { id: SITE_CONTENT_ID },
    select: {
      gelPerUsdMinor: true,
      gelPerEurMinor: true,
      deliveryIntlCents: true,
      deliveryTbilisiCents: true,
      deliveryRegionCents: true,
    },
  });
  if (!row) return { ...staticCommerceFallback };
  return {
    gelPerUsd: minorToMajor(row.gelPerUsdMinor, staticCommerceFallback.gelPerUsd),
    gelPerEur: minorToMajor(row.gelPerEurMinor, staticCommerceFallback.gelPerEur),
    deliveryIntlCents: row.deliveryIntlCents ?? staticCommerceFallback.deliveryIntlCents,
    deliveryTbilisiCents: row.deliveryTbilisiCents ?? staticCommerceFallback.deliveryTbilisiCents,
    deliveryRegionCents: row.deliveryRegionCents ?? staticCommerceFallback.deliveryRegionCents,
  };
}
