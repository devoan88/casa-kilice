import type { MessageKey } from "@/i18n/messages";

export function shopCardKeyForSlug(slug: string): MessageKey {
  if (slug === "luminous-ivory-duo") return "shop_card_luminous";
  if (slug === "soleil-bronze-duo") return "shop_card_soleil";
  if (slug === "velvet-noir-duo") return "shop_card_velvet";
  return "shop_card_luminous";
}

export function pdpSubtitleKeyForSlug(slug: string): MessageKey {
  if (slug === "luminous-ivory-duo") return "pdp_sub_luminous";
  if (slug === "soleil-bronze-duo") return "pdp_sub_soleil";
  if (slug === "velvet-noir-duo") return "pdp_sub_velvet";
  return "pdp_sub_luminous";
}
