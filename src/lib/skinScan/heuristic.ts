import type { SkinAnalysis } from "@/lib/skinScan/types";
import { normalizeDepth, normalizeUndertone } from "@/lib/skinScan/productMap";

export function heuristicSkinAnalysis(skinFocus?: string | null, mood?: string | null): SkinAnalysis {
  let undertone = "Neutral" as SkinAnalysis["undertone"];
  let depth = "Medium" as SkinAnalysis["depth"];

  if (skinFocus === "glow") {
    depth = "Light";
    undertone = "Warm";
  } else if (skinFocus === "hydration") {
    depth = "Light";
    undertone = "Neutral";
  } else if (skinFocus === "tone") {
    depth = "Tan";
    undertone = "Neutral";
  }

  if (mood === "moon") {
    depth = "Deep";
    undertone = "Cool";
  } else if (mood === "sparkle") {
    depth = "Light";
    undertone = "Warm";
  } else if (mood === "sun") {
    undertone = "Warm";
  }

  return {
    undertone: normalizeUndertone(undertone),
    depth: normalizeDepth(depth),
    visionNotes: "Heuristic profile (upload photo + configure OPENAI_API_KEY or GEMINI_API_KEY for vision).",
  };
}
