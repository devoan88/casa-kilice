import type { SkinAnalysis } from "@/lib/skinScan/types";
import { normalizeDepth, normalizeUndertone } from "@/lib/skinScan/productMap";
import { stylingFromVisionJson } from "@/lib/skinScan/stylingProfile";
import { wellnessFromVisionJson } from "@/lib/skinScan/wellnessProtocol";

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

export async function analyzeSkinWithOpenAI(
  imageBase64: string,
  mime: string,
): Promise<SkinAnalysis | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0.25,
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content: [
            "You analyze ONE portrait for complexion + holistic wellness-style education (NOT medical diagnosis, NO dosages, NO disease names).",
            "First infer presentation from visible cues: genderPresentation must be exactly one of: female, male, unknown.",
            "Tailor every prose field to THIS photo's lighting, facial structure, visible skin/hair/beard — avoid generic boilerplate.",
            "If genderPresentation is male: masculineGrooming must be 2–4 sentences on beard line/shape, men's hydration, SPF, grooming rhythm, and garment direction; do NOT suggest makeup; hairColorAnalysis should still suggest flattering hair shades vs undertone + eye read; clothingPalette must lead with professional neutrals Navy, Charcoal, Graphite (plus tailored accents) when they suit the frame.",
            "If female: masculineGrooming may be empty string; hairColorAnalysis and clothingPalette still required.",
            "Reply ONLY one JSON object with:",
            '"undertone":"Cool"|"Warm"|"Neutral","depth":"Fair"|"Light"|"Medium"|"Tan"|"Deep"|"Rich","notes":"short phrase",',
            '"genderPresentation":"female"|"male"|"unknown",',
            '"eyeColorHint":"one short phrase describing perceived eye colour family",',
            '"hairColorAnalysis":"2–4 sentences: suggested dye/highlights or natural depth vs undertone + eyes",',
            '"colorSeason":"named season e.g. Deep Autumn, Cool Winter, True Spring",',
            '"clothingPalette":["6–10 specific colour names that flatter this person"],',
            '"dailyMotivation":"one sophisticated motivational sentence tied to their scan",',
            '"masculineGrooming":"string — beard/skin/garment advice for men; empty for women if not applicable",',
            '"texture":{"summary":"visible texture: pores, lines, dryness — one sentence"},',
            '"signals":{"hydration":"low|moderate|high + brief why","elasticity":"brief qualitative","fatigue":"brief qualitative"},',
            '"skincare":{"routine":"2–4 sentences AM/PM style","cleansingFrequency":"how often to cleanse for this read","actives":"AHA/BHA vs humectants — educational"},',
            '"supplements":{"suggestions":["max 4 general items like vitamin D, omega-3, collagen — no mg"],"note":"consult clinician"},',
            '"lifestyle":{"sleepHours":"range","exercise":"yoga vs cardio bias + why light","nutrition":"antioxidant-rich pattern"},',
            '"sunSafety":{"tanningAdvice":"safe vs risky","spfGuidance":"SPF level habit","uvIndexContext":"when UV high"},',
            '"casaKiliceMultiUse":"2–3 sentences: unique multi-plane uses for the Casa Kilicé duo (powder + cream) on eyes, cheeks, perimeter, lips — no other brands",',
            "If uncertain on complexion use Neutral and Medium. Keep strings informative but not rambling.",
          ].join(" "),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze undertone, depth, gender presentation, eyes/hair reads, colour season + clothing palette, daily motivation line, men's grooming if applicable, plus skin texture, hydration/elasticity/fatigue cues, and sun-smart habits for a beauty-wellness report.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.warn("[skinScan/openai] HTTP", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) return null;
  const jsonStr = extractJsonObject(raw) ?? raw;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
  const wellnessFromVision = wellnessFromVisionJson(parsed);
  const stylingFromVision = stylingFromVisionJson(parsed);
  return {
    undertone: normalizeUndertone(parsed.undertone as string | undefined),
    depth: normalizeDepth(parsed.depth as string | undefined),
    visionNotes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    wellnessFromVision,
    stylingFromVision,
  };
}
