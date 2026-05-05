import type { WellnessProtocol } from "@/lib/skinScan/types";

export type FaceZoneKey = "t_zone" | "cheeks" | "under_eyes" | "perimeter";

const ZONE_LABELS: Record<FaceZoneKey, string> = {
  t_zone: "T-zone & centre face",
  cheeks: "Cheeks & mid-face",
  under_eyes: "Periorbital area",
  perimeter: "Perimeter & jaw",
};

/** Heuristic mapping from wellness copy + focus — not clinical face parsing. */
export function inferFaceZones(w: WellnessProtocol | undefined, skinFocus?: string | null): FaceZoneKey[] {
  if (!w) return ["cheeks"];
  const blob = [
    w.texture.summary,
    w.signals.hydration,
    w.signals.elasticity,
    w.signals.fatigue,
    w.skincare.routine,
    w.sunSafety.uvIndexContext,
    skinFocus ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const zones = new Set<FaceZoneKey>();
  if (/t-zone|t zone|forehead|nose bridge|nose|pore|shine|oil|centre|center/.test(blob)) zones.add("t_zone");
  if (/cheek|midface|flush|dry|barrier|apple/.test(blob)) zones.add("cheeks");
  if (/eye|orbit|fatigue|dark|periorbital|tear|lid/.test(blob)) zones.add("under_eyes");
  if (/perimeter|jaw|hairline|temple|sun|periphery|outer/.test(blob)) zones.add("perimeter");
  if (skinFocus === "hydration") zones.add("cheeks");
  if (skinFocus === "tone") zones.add("perimeter");
  if (skinFocus === "glow") zones.add("cheeks");
  if (zones.size === 0) zones.add("cheeks");
  return [...zones];
}

export function faceZoneLabel(z: FaceZoneKey): string {
  return ZONE_LABELS[z];
}
