export type DeliveryZone = "intl" | "ge_tbilisi" | "ge_region";

import type { CommerceRates } from "@/lib/commerceConstants";

export function shippingCentsForZone(zone: DeliveryZone, fees: Pick<CommerceRates, "deliveryIntlCents" | "deliveryTbilisiCents" | "deliveryRegionCents">): number {
  switch (zone) {
    case "intl":
      return fees.deliveryIntlCents;
    case "ge_tbilisi":
      return fees.deliveryTbilisiCents;
    case "ge_region":
      return fees.deliveryRegionCents;
    default:
      return fees.deliveryIntlCents;
  }
}
