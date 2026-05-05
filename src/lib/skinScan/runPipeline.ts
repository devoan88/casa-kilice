import { buildConsultationPayload, composeArtistNarrative } from "@/lib/skinScan/narrative";
import { heuristicSkinAnalysis } from "@/lib/skinScan/heuristic";
import type { AnalysisSource, ConsultationAnalysisPayload } from "@/lib/skinScan/types";
import { analyzeSkinWithAnthropic } from "@/lib/skinScan/visionAnthropic";
import { analyzeSkinWithGemini } from "@/lib/skinScan/visionGemini";
import { analyzeSkinWithOpenAI } from "@/lib/skinScan/visionOpenAI";

export async function runSkinAnalysisPipeline(input: {
  photoBuf: Buffer | null;
  photoMime: string | null;
  skinFocus?: string | null;
  mood?: string | null;
}): Promise<{
  payload: ConsultationAnalysisPayload;
  aiRecommendation: string;
  source: AnalysisSource;
}> {
  let analysis = heuristicSkinAnalysis(input.skinFocus ?? null, input.mood ?? null);
  let source: AnalysisSource = "heuristic";

  if (input.photoBuf && input.photoMime) {
    const b64 = input.photoBuf.toString("base64");
    const anthropic = await analyzeSkinWithAnthropic(b64, input.photoMime);
    if (anthropic) {
      analysis = anthropic;
      source = "anthropic";
    } else {
      const openai = await analyzeSkinWithOpenAI(b64, input.photoMime);
      if (openai) {
        analysis = openai;
        source = "openai";
      } else {
        const gem = await analyzeSkinWithGemini(b64, input.photoMime);
        if (gem) {
          analysis = gem;
          source = "gemini";
        }
      }
    }
  }

  const payload = buildConsultationPayload(analysis, source, {
    skinFocus: input.skinFocus ?? null,
    mood: input.mood ?? null,
  });
  const aiRecommendation = await composeArtistNarrative(payload);
  return { payload, aiRecommendation, source };
}
