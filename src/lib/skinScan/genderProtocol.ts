import type { GenderPresentation, StylingProfile } from "@/lib/skinScan/types";

/** Distinct protocol paths for vision + narrative + wardrobe hints. */
export type GenderProtocolPath = "male" | "female" | "unknown";

export function resolveGenderProtocolPath(presentation: GenderPresentation): GenderProtocolPath {
  if (presentation === "male" || presentation === "female") return presentation;
  return "unknown";
}

export function isMalePresentation(presentation: GenderPresentation): boolean {
  return presentation === "male";
}

export function isFemalePresentation(presentation: GenderPresentation): boolean {
  return presentation === "female";
}

/** Anchors for male professional styling — merged ahead of model palette when gender is male. */
export const MALE_PROFESSIONAL_STYLE_ANCHORS = [
  "Navy",
  "Charcoal",
  "Graphite",
  "Steel blue",
  "Black",
  "Cool grey",
] as const;

export function mergeMasculineProfessionalPalette(existing: string[]): string[] {
  const seen = new Set(existing.map((s) => s.toLowerCase().trim()));
  const merged: string[] = [];
  for (const c of MALE_PROFESSIONAL_STYLE_ANCHORS) {
    if (!seen.has(c.toLowerCase())) {
      seen.add(c.toLowerCase());
      merged.push(c);
    }
  }
  for (const c of existing) {
    const t = c.trim();
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      merged.push(t);
    }
  }
  return merged.slice(0, 12);
}

/** Short protocol label for admin / PDF headers. */
export function genderProtocolLabel(styling: Pick<StylingProfile, "genderPresentation">): string {
  const p = resolveGenderProtocolPath(styling.genderPresentation);
  if (p === "male") return "Male grooming & professional style";
  if (p === "female") return "Casa Kilicé beauty, hair & skincare";
  return "General wellness passport";
}
