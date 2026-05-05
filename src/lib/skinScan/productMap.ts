import { productDefs } from "@/lib/products";

import type { SkinAnalysis, SkinDepth, Undertone } from "@/lib/skinScan/types";

const DEPTH_SLUG: Record<SkinDepth, string> = {
  Fair: "luminous-ivory-duo",
  Light: "luminous-ivory-duo",
  Medium: "soleil-bronze-duo",
  Tan: "soleil-bronze-duo",
  Deep: "velvet-noir-duo",
  Rich: "velvet-noir-duo",
};

export function primarySlugForDepth(depth: SkinDepth): string {
  return DEPTH_SLUG[depth] ?? "luminous-ivory-duo";
}

export function productNameForSlug(slug: string): string {
  return productDefs.find((p) => p.slug === slug)?.name ?? slug;
}

/** Casa Kilicé–only routine hints (duo compacts: powder + cream). */
export function buildRoutineHints(analysis: SkinAnalysis, primarySlug: string): string[] {
  const { undertone, depth } = analysis;
  const hints: string[] = [];

  if (primarySlug === "velvet-noir-duo") {
    hints.push(
      "Your hero is the **Deep Tone** duo: espresso-walnut fine-milled powder sculpts and sets; molten cocoa cream brings depth and glow in one compact.",
    );
    hints.push(
      "Multi-use ritual: tap the **cream contour** along cheekbones, then blend a whisper on lips and across lids for a refined monochromatic moment.",
    );
    hints.push(
      "Use the **fine-milled powder** lightly through the T-zone and outer perimeter to set without flattening radiance.",
    );
  } else if (primarySlug === "soleil-bronze-duo") {
    hints.push(
      "Reach for the **Bronzer Tone** duo: terracotta powder warms the perimeter; bronze cream lifts high points with sunlit dimension.",
    );
    hints.push(
      "For a cohesive look, blend the **cream** on lids and lips with a soft fingertip—one shade family, couture simplicity.",
    );
    hints.push("Set the T-zone with the **powder half** using a fluffy brush; keep the centre of the face luminous.");
  } else {
    hints.push(
      "The **Light Tone** duo pairs a toasted-wheat matte powder for soft blur with a bronze-glow cream for lit-from-within radiance.",
    );
    hints.push(
      "Try the **cream** as a subtle wash on eyes and a sheer veil on lips for an effortless tonal wash.",
    );
    hints.push("Press the **fine-milled powder** through the T-zone to refine texture while preserving glow.");
  }

  if (undertone === "Cool") {
    hints.push("Cool undertone: keep transitions feather-soft; avoid heavy orange warmth at the perimeter.");
  } else if (undertone === "Warm") {
    hints.push("Warm undertone: lean into sunlit bronzing; keep powder sheer so golden undertones stay true.");
  } else {
    hints.push("Neutral undertone: you have flexibility—balance warmth on the perimeter with soft light on the centre of the face.");
  }

  if (depth === "Fair" || depth === "Light") {
    hints.push("Fair-to-light depth: build coverage gradually in fine layers—Casa Kilicé powders reward a light hand.");
  } else if (depth === "Deep" || depth === "Rich") {
    hints.push("Rich depth: let the cream anchor depth first, then set selectively so skin never reads flat.");
  }

  return hints;
}

export function normalizeUndertone(s: string | undefined): Undertone {
  const t = (s ?? "").trim().toLowerCase();
  if (t.includes("cool")) return "Cool";
  if (t.includes("warm")) return "Warm";
  return "Neutral";
}

export function normalizeDepth(s: string | undefined): SkinDepth {
  const t = (s ?? "").trim().toLowerCase();
  const order: SkinDepth[] = ["Fair", "Light", "Medium", "Tan", "Deep", "Rich"];
  for (const d of order) {
    if (t.includes(d.toLowerCase())) return d;
  }
  return "Medium";
}
