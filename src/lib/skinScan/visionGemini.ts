import type { SkinAnalysis } from "@/lib/skinScan/types";
import { normalizeDepth, normalizeUndertone } from "@/lib/skinScan/productMap";
import { stylingFromVisionJson } from "@/lib/skinScan/stylingProfile";
import { wellnessFromVisionJson } from "@/lib/skinScan/wellnessProtocol";

export async function analyzeSkinWithGemini(
  imageBase64: string,
  mime: string,
): Promise<SkinAnalysis | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.GEMINI_VISION_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: [
                "Return ONLY JSON (no markdown) for this portrait. Infer genderPresentation: female|male|unknown from visible cues.",
                "If male: fill masculineGrooming (beard, men's skin, SPF, style); do NOT suggest makeup; clothingPalette must lead with Navy, Charcoal, Graphite for professional tailoring when suited. If female: masculineGrooming can be empty string.",
                "All prose must reference THIS image (lighting, features) — not generic.",
                '{"undertone":"Cool"|"Warm"|"Neutral","depth":"Fair"|"Light"|"Medium"|"Tan"|"Deep"|"Rich","notes":"short",',
                '"genderPresentation":"female"|"male"|"unknown","eyeColorHint":"short","hairColorAnalysis":"2–4 sentences",',
                '"colorSeason":"e.g. Deep Autumn","clothingPalette":["6–10 named colours"],"dailyMotivation":"one sentence","masculineGrooming":"string",',
                '"texture":{"summary":"pores/lines/dryness one sentence"},',
                '"signals":{"hydration":"...","elasticity":"...","fatigue":"..."},',
                '"skincare":{"routine":"...","cleansingFrequency":"...","actives":"AHA/BHA vs hydrators — not medical"},',
                '"supplements":{"suggestions":["vitamin D","omega-3"],"note":"see clinician — no dosages"},',
                '"lifestyle":{"sleepHours":"7–8h","exercise":"yoga or cardio","nutrition":"antioxidants"},',
                '"sunSafety":{"tanningAdvice":"...","spfGuidance":"...","uvIndexContext":"..."},',
                '"casaKiliceMultiUse":"2–3 sentences: unique Casa Kilicé duo multi-use ritual on eyes, cheeks, lips — no other brands"}',
                "Educational beauty-wellness only; not a diagnosis.",
              ].join(" "),
            },
            { inlineData: { mimeType: mime, data: imageBase64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.25, maxOutputTokens: 1536 },
    }),
  });

  if (!res.ok) {
    console.warn("[skinScan/gemini] HTTP", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("")?.trim();
  if (!raw) return null;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const jsonStr = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
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
