export type MuseCelebrationTier = "Bronze" | "Gold" | "Elite";

export type MusePendingCelebrationPayload = {
  tier: MuseCelebrationTier;
  discountCode?: string;
};

export function parseMusePendingCelebration(raw: string | null): MusePendingCelebrationPayload | null {
  if (!raw?.trim()) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const tier = (o as { tier?: string }).tier;
    if (tier !== "Bronze" && tier !== "Gold" && tier !== "Elite") return null;
    const discountCode = (o as { discountCode?: string }).discountCode;
    return {
      tier,
      discountCode: typeof discountCode === "string" && discountCode.length > 0 ? discountCode : undefined,
    };
  } catch {
    return null;
  }
}

/** Dashboard copy — Georgian, per product request. */
export function formatMuseCelebrationKa(payload: MusePendingCelebrationPayload): string {
  const code = payload.discountCode ?? "";
  switch (payload.tier) {
    case "Bronze":
      return `გილოცავთ! თქვენ გახდით Casa Kilicé Bronze Muse. თქვენი 15%-იანი ფასდაკლების კოდია: ${code}`;
    case "Gold":
      return `გილოცავთ! თქვენ გახდით Casa Kilicé Gold Muse. სახლმა მოგინიშნათ Birthday Box მიწოდებისთვის.${code ? ` თქვენი 15%-იანი კოდი: ${code}.` : ""}`;
    case "Elite":
      return `გილოცავთ! თქვენ ხართ Casa Kilicé Elite Muse — სიცოცხლის განმავლობაში უფასო მიწოდება ჩართულია.${code ? ` 15%-იანი კოდი: ${code}.` : ""}`;
  }
}
