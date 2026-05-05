import type { SkinDepth, Undertone, WellnessProtocol } from "@/lib/skinScan/types";

export const MEDICAL_DISCLAIMER_KA =
  "ეს არის AI-ს მიერ გენერირებული რეკომენდაცია და არ წარმოადგენს სამედიცინო დიაგნოზს. ვიტამინების მიღებამდე გაიარეთ კონსულტაცია ექიმთან.";

export const MEDICAL_DISCLAIMER_EN =
  "This is AI-generated guidance and does not constitute a medical diagnosis. Consult a physician before starting any supplement regimen.";

function asStr(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asStrArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((s) => s.trim());
}

/** Parse nested object from vision JSON (tolerant of missing keys). */
export function wellnessFromVisionJson(parsed: Record<string, unknown>): Partial<WellnessProtocol> | undefined {
  const texture = parsed.texture as Record<string, unknown> | undefined;
  const signals = parsed.signals as Record<string, unknown> | undefined;
  const skincare = parsed.skincare as Record<string, unknown> | undefined;
  const supplements = parsed.supplements as Record<string, unknown> | undefined;
  const lifestyle = parsed.lifestyle as Record<string, unknown> | undefined;
  const sunSafety = parsed.sunSafety as Record<string, unknown> | undefined;

  const partial: Partial<WellnessProtocol> = {};

  const tex = asStr(texture?.summary);
  if (tex) partial.texture = { summary: tex };

  const hyd = asStr(signals?.hydration);
  const ela = asStr(signals?.elasticity);
  const fat = asStr(signals?.fatigue);
  if (hyd || ela || fat) {
    partial.signals = {
      hydration: hyd ?? "",
      elasticity: ela ?? "",
      fatigue: fat ?? "",
    };
  }

  const r = asStr(skincare?.routine);
  const c = asStr(skincare?.cleansingFrequency);
  const a = asStr(skincare?.actives);
  if (r || c || a) {
    partial.skincare = {
      routine: r ?? "",
      cleansingFrequency: c ?? "",
      actives: a ?? "",
    };
  }

  const sug = asStrArr(supplements?.suggestions);
  const sn = asStr(supplements?.note);
  if (sug.length || sn) {
    partial.supplements = { suggestions: sug, note: sn ?? "" };
  }

  const sl = asStr(lifestyle?.sleepHours);
  const ex = asStr(lifestyle?.exercise);
  const nu = asStr(lifestyle?.nutrition);
  if (sl || ex || nu) {
    partial.lifestyle = {
      sleepHours: sl ?? "",
      exercise: ex ?? "",
      nutrition: nu ?? "",
    };
  }

  const ta = asStr(sunSafety?.tanningAdvice);
  const sp = asStr(sunSafety?.spfGuidance);
  const uv = asStr(sunSafety?.uvIndexContext);
  if (ta || sp || uv) {
    partial.sunSafety = {
      tanningAdvice: ta ?? "",
      spfGuidance: sp ?? "",
      uvIndexContext: uv ?? "",
    };
  }

  const multi =
    asStr((parsed as { casaKiliceMultiUse?: unknown }).casaKiliceMultiUse) ??
    asStr((parsed as { multiUseTips?: unknown }).multiUseTips);
  if (multi) partial.casaKiliceMultiUse = multi;

  if (
    !partial.texture &&
    !partial.signals &&
    !partial.skincare &&
    !partial.supplements &&
    !partial.lifestyle &&
    !partial.sunSafety &&
    !partial.casaKiliceMultiUse
  ) {
    return undefined;
  }
  return partial;
}

function defaultTexture(depth: SkinDepth, skinFocus?: string | null): string {
  if (skinFocus === "hydration") {
    return "Focus on comfort and barrier support; fine lines may read more when the surface is dehydrated.";
  }
  if (skinFocus === "tone") {
    return "Evenness and micro-texture around pores and sun-exposed zones are common priorities.";
  }
  if (skinFocus === "glow") {
    return "Surface reflectivity and micro-texture influence how light catches the high points of the face.";
  }
  if (depth === "Fair" || depth === "Light") {
    return "Lighter phototypes often show early fine lines and translucency; pores are typically finer.";
  }
  if (depth === "Deep" || depth === "Rich") {
    return "Richer melanin can delay some photo-ageing signs; still monitor texture and evenness.";
  }
  return "Visible texture (pores, fine lines) and surface evenness inform how complexion products sit on skin.";
}

function defaultSignals(mood?: string | null): WellnessProtocol["signals"] {
  if (mood === "moon") {
    return {
      hydration: "moderate — night-mode rituals favour barrier-friendly layers.",
      elasticity: "maintain with sleep and gentle movement; photo-only estimate.",
      fatigue: "Cool, low-light mood — prioritise restful wind-down and screen breaks.",
    };
  }
  if (mood === "sparkle") {
    return {
      hydration: "moderate to high — luminous looks reward plump, smooth canvas.",
      elasticity: "support with consistent sleep; photo-only estimate.",
      fatigue: "Bright mood — balance stimulation with recovery days.",
    };
  }
  if (mood === "sun") {
    return {
      hydration: "moderate — warmth and UV call for barrier care and SPF habits.",
      elasticity: "protect collagen pathways with sun-smart behaviour; photo-only estimate.",
      fatigue: "Daylight energy — anchor with hydration and shade breaks.",
    };
  }
  return {
    hydration: "moderate — adjust cleansing if the surface feels tight after washing.",
    elasticity: "general maintenance via sleep, protein, and movement; photo-only estimate.",
    fatigue: "Neutral profile — steady sleep windows help perceived freshness.",
  };
}

function defaultSkincare(skinFocus?: string | null): WellnessProtocol["skincare"] {
  if (skinFocus === "hydration") {
    return {
      routine: "Gentle cleanser, humectant serum (e.g. glycerin, hyaluronic acid), emollient cream; exfoliate lightly 1–2×/week if tolerated.",
      cleansingFrequency: "Once daily for dry skin; twice if oily or SPF-heavy — rinse thoroughly, no harsh stripping.",
      actives: "Prioritise hydrators; add PHA or low % BHA only if congestion appears and barrier feels intact.",
    };
  }
  if (skinFocus === "tone") {
    return {
      routine: "AM antioxidant serum, SPF daily; PM consider gentle AHA or azelaic acid on non-sensitive nights with moisturiser.",
      cleansingFrequency: "Twice daily with lukewarm water if wearing makeup/SPF; single gentle cleanse on minimal days.",
      actives: "AHA for surface glow; BHA for oilier zones; always pair with SPF.",
    };
  }
  if (skinFocus === "glow") {
    return {
      routine: "Layer humectants under a light occlusive; occasional AHA for radiance without over-stripping.",
      cleansingFrequency: "Evening double-cleanse when using long-wear makeup; morning single mild cleanse.",
      actives: "Alternate AHA nights with recovery nights; avoid stacking strong acids.",
    };
  }
  return {
    routine: "Cleanse, treat (as tolerated), moisturise, SPF in daylight — keep steps minimal until skin feels stable.",
    cleansingFrequency: "Typically morning + evening; dry types may skip morning cleanser if not oily.",
    actives: "Introduce one active at a time: AHA/BHA for texture, or focus on barrier repair if sensitive.",
  };
}

function defaultSupplements(depth: SkinDepth): WellnessProtocol["supplements"] {
  const base: string[] = ["Omega-3 fatty acids (general wellness)", "Vitamin D (common insufficiency — verify with labs)"];
  if (depth === "Fair" || depth === "Light") {
    base.push("Vitamin C–rich foods or a dietitian-guided antioxidant strategy");
  }
  base.push("Collagen peptides only if aligned with your clinician’s advice");
  return {
    suggestions: base,
    note: "No dosages — discuss testing, contraindications, and drug interactions with a licensed clinician.",
  };
}

function defaultLifestyle(mood?: string | null): WellnessProtocol["lifestyle"] {
  return {
    sleepHours: mood === "moon" ? "7.5–9 h with a fixed wind-down" : "7–8.5 h, consistent wake time",
    exercise: mood === "sparkle" ? "Mix dance or brisk walks with mobility" : "Blend low-impact yoga with 2× weekly cardio for circulation",
    nutrition: "Colourful plants (berries, greens), olive oil, legumes — antioxidant-dense pattern without extreme restriction.",
  };
}

function defaultSun(depth: SkinDepth, undertone: Undertone): WellnessProtocol["sunSafety"] {
  const spf =
    depth === "Fair" || depth === "Light"
      ? "SPF 50+ broad-spectrum daily on exposed skin; reapply every 2 h outdoors."
      : "SPF 30–50+ daily; reapply after sweat or swimming.";
  const tan =
    depth === "Fair" || depth === "Light"
      ? "Intentional tanning is high-risk for your depth — prefer gradual self-tan and shade."
      : "Tan gradually with strict SPF; UV still drives uneven tone and elasticity loss.";
  return {
    tanningAdvice: tan,
    spfGuidance: spf,
    uvIndexContext:
      undertone === "Cool"
        ? "On high UV-index days, seek shade 10–16h and wear a hat — cool undertones often burn faster when fair."
        : "Check local UV index; when ≥6, minimise midday exposure regardless of undertone.",
  };
}

function defaultCasaKiliceMultiUse(): string {
  return "One Casa Kilicé duo: sweep powder where you want atmosphere to recede; press cream on high planes, lids, or lips for a tonal veil — travel light, edit often.";
}

export function completeWellness(
  partial: Partial<WellnessProtocol> | undefined,
  ctx: {
    depth: SkinDepth;
    undertone: Undertone;
    skinFocus?: string | null;
    mood?: string | null;
  },
): WellnessProtocol {
  const { depth, undertone, skinFocus, mood } = ctx;

  const texture = partial?.texture?.summary
    ? partial.texture
    : { summary: defaultTexture(depth, skinFocus) };

  const signals =
    partial?.signals?.hydration || partial?.signals?.elasticity || partial?.signals?.fatigue
      ? {
          hydration: partial.signals!.hydration || defaultSignals(mood).hydration,
          elasticity: partial.signals!.elasticity || defaultSignals(mood).elasticity,
          fatigue: partial.signals!.fatigue || defaultSignals(mood).fatigue,
        }
      : defaultSignals(mood);

  const skincare =
    partial?.skincare?.routine || partial?.skincare?.cleansingFrequency || partial?.skincare?.actives
      ? {
          routine: partial.skincare!.routine || defaultSkincare(skinFocus).routine,
          cleansingFrequency:
            partial.skincare!.cleansingFrequency || defaultSkincare(skinFocus).cleansingFrequency,
          actives: partial.skincare!.actives || defaultSkincare(skinFocus).actives,
        }
      : defaultSkincare(skinFocus);

  const supplements =
    partial?.supplements?.suggestions?.length || partial?.supplements?.note
      ? {
          suggestions:
            partial.supplements!.suggestions?.length ? partial.supplements!.suggestions : defaultSupplements(depth).suggestions,
          note: partial.supplements!.note || defaultSupplements(depth).note,
        }
      : defaultSupplements(depth);

  const lifestyle =
    partial?.lifestyle?.sleepHours || partial?.lifestyle?.exercise || partial?.lifestyle?.nutrition
      ? {
          sleepHours: partial.lifestyle!.sleepHours || defaultLifestyle(mood).sleepHours,
          exercise: partial.lifestyle!.exercise || defaultLifestyle(mood).exercise,
          nutrition: partial.lifestyle!.nutrition || defaultLifestyle(mood).nutrition,
        }
      : defaultLifestyle(mood);

  const sunSafety =
    partial?.sunSafety?.tanningAdvice || partial?.sunSafety?.spfGuidance || partial?.sunSafety?.uvIndexContext
      ? {
          tanningAdvice: partial.sunSafety!.tanningAdvice || defaultSun(depth, undertone).tanningAdvice,
          spfGuidance: partial.sunSafety!.spfGuidance || defaultSun(depth, undertone).spfGuidance,
          uvIndexContext: partial.sunSafety!.uvIndexContext || defaultSun(depth, undertone).uvIndexContext,
        }
      : defaultSun(depth, undertone);

  const casaKiliceMultiUse =
    typeof partial?.casaKiliceMultiUse === "string" && partial.casaKiliceMultiUse.trim()
      ? partial.casaKiliceMultiUse.trim()
      : defaultCasaKiliceMultiUse();

  return { texture, signals, skincare, supplements, lifestyle, sunSafety, casaKiliceMultiUse };
}
