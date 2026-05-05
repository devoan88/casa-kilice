import { mergeMasculineProfessionalPalette } from "@/lib/skinScan/genderProtocol";
import type { GenderPresentation, StylingProfile, Undertone } from "./types";

const DEFAULT_MOTIVATION =
  "Your daily care is a small ritual that steadies you today and reads as quiet confidence tomorrow.";

function asString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, 14);
}

export function normalizeGenderPresentation(raw: unknown): GenderPresentation {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("female") || s.includes("woman") || s === "f") return "female";
  if (s.includes("male") && !s.includes("female")) return "male";
  if (s === "m" || s === "man" || s === "men") return "male";
  return "unknown";
}

export function stylingFromVisionJson(raw: unknown): Partial<StylingProfile> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const genderPresentation = normalizeGenderPresentation(o.genderPresentation ?? o.gender);
  const eyeColorHint = asString(o.eyeColorHint ?? o.eye_color_hint);
  const hairColorAnalysis = asString(o.hairColorAnalysis ?? o.hair_color_analysis);
  const colorSeason = asString(o.colorSeason ?? o.color_season);
  const clothingPalette = asStringArray(o.clothingPalette ?? o.clothing_palette);
  const dailyMotivation = asString(o.dailyMotivation ?? o.daily_motivation);
  const masculineGrooming = asString(o.masculineGrooming ?? o.masculine_grooming);

  const out: Partial<StylingProfile> = {};
  if (genderPresentation !== "unknown") out.genderPresentation = genderPresentation;
  if (eyeColorHint) out.eyeColorHint = eyeColorHint;
  if (hairColorAnalysis) out.hairColorAnalysis = hairColorAnalysis;
  if (colorSeason) out.colorSeason = colorSeason;
  if (clothingPalette.length) out.clothingPalette = clothingPalette;
  if (dailyMotivation) out.dailyMotivation = dailyMotivation;
  if (masculineGrooming) out.masculineGrooming = masculineGrooming;
  return Object.keys(out).length ? out : undefined;
}

function inferColorSeasonFromUndertone(u: Undertone): string {
  if (u === "Cool") return "Cool Winter / True Winter";
  if (u === "Warm") return "Warm Autumn / True Spring";
  return "Soft Summer / Neutral";
}

function coercePalette(partial: Partial<StylingProfile> | undefined): string[] {
  const raw = partial?.clothingPalette as unknown;
  if (Array.isArray(raw)) return asStringArray(raw);
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,;|]/u)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 14);
  }
  return [];
}

export function completeStylingProfile(
  partial: Partial<StylingProfile> | undefined,
  undertone: Undertone,
): StylingProfile {
  const g = partial?.genderPresentation;
  const genderPresentation: GenderPresentation =
    g === "male" || g === "female" || g === "unknown" ? g : normalizeGenderPresentation(g);
  const eyeColorHint =
    typeof partial?.eyeColorHint === "string" && partial.eyeColorHint.trim()
      ? partial.eyeColorHint.trim()
      : "Eye colour reads softly in this frame — the palette below still anchors to your undertone.";
  const hairRaw = partial?.hairColorAnalysis;
  const hairColorAnalysis =
    typeof hairRaw === "string" && hairRaw.trim()
      ? hairRaw.trim()
      : `Recommended hair depths lean ${undertone === "Cool" ? "cool" : undertone === "Warm" ? "warm" : "neutral"} against your undertone — refine with the season list below.`;
  const seasonRaw = partial?.colorSeason;
  const colorSeason =
    typeof seasonRaw === "string" && seasonRaw.trim() ? seasonRaw.trim() : inferColorSeasonFromUndertone(undertone);
  const fromPartial = coercePalette(partial);
  const clothingPalette =
    fromPartial.length > 0
      ? fromPartial
      : undertone === "Cool"
        ? ["navy", "burgundy", "black", "cool grey", "pine green"]
        : undertone === "Warm"
          ? ["caramel", "olive", "warm camel", "amber", "antique gold"]
          : ["soft beige", "black", "ivory", "wine", "graphite"];
  const motRaw = partial?.dailyMotivation;
  const dailyMotivation = typeof motRaw === "string" && motRaw.trim() ? motRaw.trim() : DEFAULT_MOTIVATION;
  const mascRaw = partial?.masculineGrooming;
  const masculineGrooming =
    typeof mascRaw === "string" && mascRaw.trim()
      ? mascRaw.trim()
      : "Keep beard lines crisp; hydrate AM/PM; SPF daily with light textures; choose structure in tailoring and one confident accent colour.";

  return {
    genderPresentation,
    eyeColorHint,
    hairColorAnalysis,
    colorSeason,
    clothingPalette,
    dailyMotivation,
    masculineGrooming,
  };
}

export function buildMasculineRoutineHints(
  undertone: Undertone,
  depthLabel: string,
  styling: StylingProfile,
): string[] {
  const u = undertone === "Cool" ? "cool undertone" : undertone === "Warm" ? "warm undertone" : "neutral undertone";
  const beard = styling.masculineGrooming.slice(0, 220);
  return [
    `Skin (${depthLabel}, ${u}): gentle AM cleanser, humectant serum, SPF — the Casa Kilicé scan codes this as your non-negotiable stack (no colour cosmetics required).`,
    `Beard & contour read: ${beard}`,
    `Texture & light: mirror where the portrait asks for extra hydration — treat those zones with care, not coverage.`,
    `Wardrobe (${styling.colorSeason}): anchor on Navy, Charcoal, and Graphite for tailoring; add one accent (deep olive or burgundy) only after neutrals read clean.`,
    `Hair direction: ${styling.hairColorAnalysis.slice(0, 200)}`,
    `Vitality: water, sleep, and short reset days — use Casa Kilicé for barrier density and polish; keep the ritual honest to how you actually move through the week.`,
  ];
}
