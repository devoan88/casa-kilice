import {
  buildRoutineHints,
  productNameForSlug,
  primarySlugForDepth,
} from "@/lib/skinScan/productMap";
import { buildMasculineRoutineHints, completeStylingProfile } from "@/lib/skinScan/stylingProfile";
import type { ConsultationAnalysisPayload, SkinAnalysis } from "@/lib/skinScan/types";
import {
  MEDICAL_DISCLAIMER_EN,
  MEDICAL_DISCLAIMER_KA,
  completeWellness,
} from "@/lib/skinScan/wellnessProtocol";

function templateNarrative(payload: ConsultationAnalysisPayload): string {
  const tone = payload.undertone;
  const depth = payload.depth;
  const s = payload.styling;

  if (s.genderPresentation === "male") {
    return [
      `Your read: ${tone} undertone, ${depth.toLowerCase()} depth — the frame reads deliberate; we keep the edit disciplined and skin-first.`,
      `Grooming line: ${s.masculineGrooming}`,
      `Wardrobe (${s.colorSeason}): professional stack around Navy, Charcoal, and Graphite; palette cues: ${s.clothingPalette.slice(0, 6).join(", ")} — one restrained accent only.`,
      `Hair: ${s.hairColorAnalysis}`,
      `Wellness passport: honour ${payload.wellness.lifestyle.sleepHours} sleep rhythm, ${payload.wellness.lifestyle.exercise}, and ${payload.wellness.sunSafety.tanningAdvice} — SPF discipline is non-negotiable; no colour cosmetics in the daily stack.`,
      `This scan is engineered at Casa Kilicé as a world-first skin intelligence ritual — barrier care, hydration, and silhouette lead.`,
    ].join("\n\n");
  }

  const primaryName = productNameForSlug(payload.primaryProductSlug);
  return [
    `${tone} undertone and ${depth.toLowerCase()} depth carry a quiet architecture on the face — we will honour that with light that feels earned, not applied.`,
    `Your Casa Kilicé chapter opens on **${primaryName}**: a single couture compact where fine-milled powder meets molten cream in deliberate counterpoint.`,
    `Sweep the powder where you want atmosphere to recede—typically through the T-zone and along the perimeter—then press the cream along high planes so warmth reads as a veil, not a stripe. The duo is engineered to travel: the same bronze veil can wash lids and lips for a tonal monolith worthy of the house.`,
    `Wellness passport: colour season ${s.colorSeason}; support awareness with ${payload.wellness.supplements.suggestions.slice(0, 3).join(", ")} (educational only); sleep ${payload.wellness.lifestyle.sleepHours}; ${payload.wellness.sunSafety.tanningAdvice}`,
  ].join("\n\n");
}

export async function composeArtistNarrative(payload: ConsultationAnalysisPayload): Promise<string> {
  const base = templateNarrative(payload);
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return base;

  const isMale = payload.styling.genderPresentation === "male";
  const systemMale =
    "You are Casa Kilicé's grooming director — precise, modern, never chatty. Write 120–170 words in refined English. Focus on beard line/shape if visible, men's hydration and SPF discipline, garment silhouette and colour season — NO makeup steps, NO lipstick/lid colour cosmetics. You may reference Casa Kilicé as the inventor of this skin-scan ritual. No markdown headings; 2–3 short paragraphs. Never recommend non–Casa Kilicé products. Do not diagnose; no supplement dosages.";
  const systemFemale =
    "You are Casa Kilicé's lead makeup artist — the 'Kilicé Touch': sensual, precise, never chatty. Write 120–170 words in refined English. Describe motion (sweep, press, feather), light behaviour (matte vs specular), and where on the face each half of the duo travels (cheeks, hollows, lids, lips). Mention only Casa Kilicé duo compacts by their given names. No markdown headings; 2–3 short paragraphs. Never recommend non–Casa Kilicé products. Do not diagnose; no supplement dosages.";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.52,
        max_tokens: 480,
        messages: [
          {
            role: "system",
            content: isMale ? systemMale : systemFemale,
          },
          {
            role: "user",
            content: isMale
              ? `Client (male presentation). Undertone ${payload.undertone}, depth ${payload.depth}. Eye read: ${payload.styling.eyeColorHint}. Colour season: ${payload.styling.colorSeason}. Clothing palette: ${payload.styling.clothingPalette.join(", ")}. Masculine grooming notes: ${payload.styling.masculineGrooming}. Hair analysis: ${payload.styling.hairColorAnalysis}. Texture: ${payload.wellness.texture.summary}. Signals: ${payload.wellness.signals.hydration} | ${payload.wellness.signals.elasticity} | ${payload.wellness.signals.fatigue}. Routine bullets:\n${payload.routineHints.map((h) => `- ${h.replace(/\*\*/g, "")}`).join("\n")}\n\nPolish this draft; stay aligned to the photo-specific cues:\n${base}`
              : `Client analysis (facts): undertone ${payload.undertone}, depth ${payload.depth}. Primary compact slug ${payload.primaryProductSlug}. Texture read: ${payload.wellness.texture.summary}. Hydration/elasticity/fatigue (photo estimate): ${payload.wellness.signals.hydration} | ${payload.wellness.signals.elasticity} | ${payload.wellness.signals.fatigue}. Routine bullets:\n${payload.routineHints.map((h) => `- ${h.replace(/\*\*/g, "")}`).join("\n")}\n\nPolish this draft while keeping factual alignment:\n${base}`,
          },
        ],
      }),
    });
    if (!res.ok) return base;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 40 ? text : base;
  } catch {
    return base;
  }
}

export function buildConsultationPayload(
  analysis: SkinAnalysis,
  source: ConsultationAnalysisPayload["analysisSource"],
  context?: { skinFocus?: string | null; mood?: string | null },
): ConsultationAnalysisPayload {
  const primaryProductSlug = primarySlugForDepth(analysis.depth);
  const { wellnessFromVision, stylingFromVision, ...rest } = analysis;
  const styling = completeStylingProfile(stylingFromVision, analysis.undertone);
  const routineHints =
    styling.genderPresentation === "male"
      ? buildMasculineRoutineHints(analysis.undertone, analysis.depth, styling)
      : buildRoutineHints(analysis, primaryProductSlug);
  const productNames = [productNameForSlug(primaryProductSlug)];
  const wellness = completeWellness(wellnessFromVision, {
    depth: analysis.depth,
    undertone: analysis.undertone,
    skinFocus: context?.skinFocus,
    mood: context?.mood,
  });
  return {
    ...rest,
    analysisSource: source,
    routineHints,
    primaryProductSlug,
    productNames,
    wellness,
    styling,
    medicalDisclaimerKa: MEDICAL_DISCLAIMER_KA,
    medicalDisclaimerEn: MEDICAL_DISCLAIMER_EN,
  };
}
