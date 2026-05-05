export type Undertone = "Cool" | "Warm" | "Neutral";
export type SkinDepth = "Fair" | "Light" | "Medium" | "Tan" | "Deep" | "Rich";

export type GenderPresentation = "female" | "male" | "unknown";

/** Styling / hair / wardrobe — from vision; merged in `buildConsultationPayload`. */
export type StylingProfile = {
  genderPresentation: GenderPresentation;
  eyeColorHint: string;
  hairColorAnalysis: string;
  colorSeason: string;
  clothingPalette: string[];
  dailyMotivation: string;
  /** Beard, skin, grooming, garment direction — primary path when `genderPresentation` is `male`. */
  masculineGrooming: string;
};

/** Holistic wellness module — educational only; not a clinical assessment. */
export type WellnessProtocol = {
  texture: { summary: string };
  signals: {
    hydration: string;
    elasticity: string;
    fatigue: string;
  };
  skincare: {
    routine: string;
    cleansingFrequency: string;
    actives: string;
  };
  supplements: {
    suggestions: string[];
    note: string;
  };
  lifestyle: {
    sleepHours: string;
    exercise: string;
    nutrition: string;
  };
  sunSafety: {
    tanningAdvice: string;
    spfGuidance: string;
    uvIndexContext: string;
  };
  /** Casa Kilicé duo multi-use ritual tips — from vision; educational. */
  casaKiliceMultiUse?: string;
};

export type SkinAnalysis = {
  undertone: Undertone;
  depth: SkinDepth;
  visionNotes?: string;
  /** Raw vision partial merged into `wellness` in `buildConsultationPayload`. */
  wellnessFromVision?: Partial<WellnessProtocol>;
  stylingFromVision?: Partial<StylingProfile>;
};

export type AnalysisSource = "anthropic" | "openai" | "gemini" | "heuristic";

export type ConsultationAnalysisPayload = Omit<SkinAnalysis, "wellnessFromVision" | "stylingFromVision"> & {
  analysisSource: AnalysisSource;
  routineHints: string[];
  primaryProductSlug: string;
  productNames: string[];
  wellness: WellnessProtocol;
  styling: StylingProfile;
  medicalDisclaimerKa: string;
  medicalDisclaimerEn: string;
};
