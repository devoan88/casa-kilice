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

function anthropicMediaType(mime: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const m = mime.toLowerCase().split(";")[0]?.trim() ?? "image/jpeg";
  if (m === "image/png" || m === "image/gif" || m === "image/webp") return m;
  return "image/jpeg";
}

const VISION_SYSTEM = [
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
].join(" ");

/**
 * Claude 3.5 Sonnet vision — same JSON contract as OpenAI/Gemini paths (`runSkinAnalysisPipeline`).
 */
export async function analyzeSkinWithAnthropic(
  imageBase64: string,
  mime: string,
): Promise<SkinAnalysis | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;

  const model =
    process.env.ANTHROPIC_VISION_MODEL?.trim() || "claude-3-5-sonnet-20241022";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.25,
      system: VISION_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: anthropicMediaType(mime),
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Analyze undertone, depth, gender presentation, eyes/hair reads, colour season + clothing palette, daily motivation line, men's grooming if applicable, plus skin texture, hydration/elasticity/fatigue cues, and sun-smart habits for a beauty-wellness report.",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.warn("[skinScan/anthropic] HTTP", res.status, err.slice(0, 500));
    return null;
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const blocks = data.content ?? [];
  const raw = blocks
    .filter((b): b is { type: "text"; text: string } => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n")
    .trim();
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
