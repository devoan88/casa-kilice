import { runSkinAnalysisPipeline } from "@/lib/skinScan/runPipeline";
import { buildConsultationPayload } from "@/lib/skinScan/narrative";
import { completeStylingProfile } from "@/lib/skinScan/stylingProfile";
import type { AnalysisSource, ConsultationAnalysisPayload } from "@/lib/skinScan/types";
import { MEDICAL_DISCLAIMER_EN, MEDICAL_DISCLAIMER_KA } from "@/lib/skinScan/wellnessProtocol";

type EngineResult = {
  payload: ConsultationAnalysisPayload;
  aiRecommendation: string;
  source: AnalysisSource;
};

/**
 * Runs skin analysis locally or forwards to a dedicated deployment (`SKIN_ENGINE_URL`)
 * that only exposes `/api/internal/skin-engine/analyze` with `SKIN_ENGINE_SECRET`.
 */
export async function invokeSkinAnalysisEngine(input: {
  photoBuf: Buffer | null;
  photoMime: string | null;
  skinFocus?: string | null;
  mood?: string | null;
}): Promise<EngineResult> {
  const base = process.env.SKIN_ENGINE_URL?.trim();
  const secret = process.env.SKIN_ENGINE_SECRET?.trim();
  if (!base || !secret) {
    return runSkinAnalysisPipeline(input);
  }

  const url = `${base.replace(/\/$/, "")}`;
  const imageBase64 =
    input.photoBuf && input.photoMime ? input.photoBuf.toString("base64") : "";
  const mimeType = input.photoMime || "image/jpeg";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Skin-Engine-Secret": secret,
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      skinFocus: input.skinFocus ?? null,
      mood: input.mood ?? null,
    }),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Skin engine HTTP ${res.status}: invalid JSON`);
  }

  if (!res.ok) {
    const err = typeof (json as { error?: unknown }).error === "string" ? (json as { error: string }).error : text;
    throw new Error(`Skin engine HTTP ${res.status}: ${err}`);
  }

  const o = json as Partial<EngineResult>;
  if (!o.payload || typeof o.aiRecommendation !== "string" || typeof o.source !== "string") {
    throw new Error("Skin engine returned an unexpected payload.");
  }

  const p = o.payload as Partial<ConsultationAnalysisPayload>;
  if (
    !p.undertone ||
    !p.depth ||
    !p.analysisSource ||
    !Array.isArray(p.routineHints) ||
    typeof p.primaryProductSlug !== "string" ||
    !Array.isArray(p.productNames)
  ) {
    throw new Error("Skin engine returned an unexpected payload.");
  }

  const source = p.analysisSource as AnalysisSource;
  const ctx = { skinFocus: input.skinFocus ?? null, mood: input.mood ?? null };

  const ensureStyling = (base: ConsultationAnalysisPayload): ConsultationAnalysisPayload => ({
    ...base,
    styling: completeStylingProfile(base.styling ?? undefined, base.undertone),
  });

  let payload: ConsultationAnalysisPayload;
  if (p.wellness && p.medicalDisclaimerKa && p.medicalDisclaimerEn) {
    payload = ensureStyling(p as ConsultationAnalysisPayload);
  } else if (p.wellness) {
    payload = ensureStyling({
      undertone: p.undertone,
      depth: p.depth,
      visionNotes: p.visionNotes,
      analysisSource: source,
      routineHints: p.routineHints,
      primaryProductSlug: p.primaryProductSlug,
      productNames: p.productNames,
      wellness: p.wellness,
      styling: completeStylingProfile(p.styling ?? undefined, p.undertone),
      medicalDisclaimerKa: MEDICAL_DISCLAIMER_KA,
      medicalDisclaimerEn: MEDICAL_DISCLAIMER_EN,
    });
  } else {
    payload = buildConsultationPayload(
      {
        undertone: p.undertone,
        depth: p.depth,
        visionNotes: p.visionNotes,
      },
      source,
      ctx,
    );
  }

  return {
    payload,
    aiRecommendation: o.aiRecommendation,
    source: o.source as AnalysisSource,
  };
}
