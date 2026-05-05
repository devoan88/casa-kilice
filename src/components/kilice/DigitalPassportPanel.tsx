import type { ReactNode } from "react";

import { MedicalDisclaimerStrip } from "@/components/legal/MedicalDisclaimerStrip";
import { FaceZoneDiagram } from "@/components/kilice/FaceZoneDiagram";
import { ProductRecommendationCard } from "@/components/kilice/ProductRecommendationCard";
import { RoutineStepCards } from "@/components/kilice/RoutineStepCards";
import { WellnessInfographicCards } from "@/components/kilice/WellnessInfographicCards";
import { useI18n } from "@/i18n/LanguageProvider";
import { inferFaceZones } from "@/lib/skinScan/faceZones";
import { productVisualKit } from "@/lib/skinScan/productVisuals";
import { completeStylingProfile } from "@/lib/skinScan/stylingProfile";
import type { StylingProfile, Undertone, WellnessProtocol } from "@/lib/skinScan/types";

export type PassportRec = { id: string; name: string; note: string; image: string };

function undertoneFromLabel(s: string): Undertone {
  if (s === "Cool" || s === "Warm" || s === "Neutral") return s;
  return "Neutral";
}

export function DigitalPassportPanel({
  variant,
  undertone,
  depth,
  analysisSource,
  aiRecommendation,
  routineHints,
  wellness,
  styling,
  showProductCard = true,
  skinFocus,
  rec,
  footerSlot,
}: {
  variant: "light" | "dark";
  undertone: string;
  depth: string;
  analysisSource: string;
  aiRecommendation: string;
  routineHints: string[];
  wellness?: WellnessProtocol;
  styling?: StylingProfile | null;
  /** When false, hides the duo card (e.g. male presentation — no makeup push). */
  showProductCard?: boolean;
  skinFocus?: string | null;
  rec: PassportRec | null;
  footerSlot?: ReactNode;
}) {
  const { t } = useI18n();
  /** Always merge + coerce so bad shapes (e.g. palette as string) cannot break the UI. */
  const stylingResolved = completeStylingProfile(styling ?? undefined, undertoneFromLabel(undertone));
  const showRecCard = showProductCard && stylingResolved.genderPresentation !== "male";

  const zones = inferFaceZones(wellness, skinFocus);
  const kit = rec ? productVisualKit(rec.id) : null;

  const profileMuted =
    variant === "dark" ? "text-[color:color-mix(in_srgb,var(--sand)_55%,transparent)]" : "text-muted";
  const narrativeClass =
    variant === "dark"
      ? "whitespace-pre-wrap text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--sand)_82%,#e8e0d8)]"
      : "whitespace-pre-wrap text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_88%,#333)]";

  const chipClass =
    variant === "dark"
      ? "rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_28%,transparent)] bg-[color:color-mix(in_srgb,#0f0c0b_90%,transparent)] px-3 py-1 text-[11px] text-[color:color-mix(in_srgb,var(--sand)_80%,transparent)]"
      : "rounded-full border border-border bg-[color:color-mix(in_srgb,var(--surface-strong)_94%,transparent)] px-3 py-1 text-[11px] text-foreground/90";

  const panelClass =
    variant === "dark"
      ? "space-y-4 rounded-[18px] border border-[color:color-mix(in_srgb,var(--espresso)_25%,transparent)] bg-[#0c0a09] p-4 text-sm text-[color:color-mix(in_srgb,var(--sand)_76%,transparent)]"
      : "space-y-4 rounded-[18px] border border-border bg-[color:color-mix(in_srgb,var(--surface-strong)_92%,transparent)] p-4 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${profileMuted}`}>
          {t("skin_scan_profile_label")} {undertone} · {depth}
        </p>
        <span className={`text-[10px] uppercase tracking-wide ${profileMuted} opacity-80`}>({analysisSource})</span>
        {stylingResolved.genderPresentation !== "unknown" ? (
          <span className={`text-[10px] uppercase tracking-wide ${profileMuted} opacity-90`}>
            · {stylingResolved.genderPresentation}
          </span>
        ) : null}
      </div>

      <div className={panelClass}>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${profileMuted}`}>{t("skin_scan_styling_kicker")}</p>
        <p className={`mt-2 text-[10px] uppercase tracking-wide ${profileMuted}`}>{t("skin_scan_hair_label")}</p>
        <p className={variant === "dark" ? "mt-1 text-sm text-[color:color-mix(in_srgb,var(--sand)_82%,transparent)]" : "mt-1 text-sm"}>
          {stylingResolved.hairColorAnalysis}
        </p>
        <p className={`mt-3 text-[10px] uppercase tracking-wide ${profileMuted}`}>{t("skin_scan_season_label")}</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-tight text-[color:var(--hermes)]">
          {stylingResolved.colorSeason}
        </p>
        <p className={`mt-3 text-[10px] uppercase tracking-wide ${profileMuted}`}>{t("skin_scan_palette_label")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stylingResolved.clothingPalette.map((c, i) => (
            <span key={`${i}-${c}`} className={chipClass}>
              {c}
            </span>
          ))}
        </div>
        <p className={`mt-4 text-[10px] uppercase tracking-wide ${profileMuted}`}>{t("skin_scan_motivation_label")}</p>
        <p className={`mt-1 italic ${variant === "dark" ? "text-[color:color-mix(in_srgb,var(--sand)_78%,transparent)]" : "text-muted"}`}>
          “{stylingResolved.dailyMotivation}”
        </p>
        {stylingResolved.genderPresentation === "male" ? (
          <>
            <p className={`mt-4 text-[10px] uppercase tracking-wide ${profileMuted}`}>{t("skin_scan_masculine_label")}</p>
            <p className="mt-1 text-sm leading-relaxed">{stylingResolved.masculineGrooming}</p>
          </>
        ) : null}
        <p className={`mt-4 text-[9px] uppercase tracking-[0.18em] ${profileMuted}`}>{t("skin_scan_designed_by")}</p>
      </div>

      {wellness ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),160px] lg:items-start">
          <div className="space-y-4">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${profileMuted}`}>{t("skin_scan_texture_label")}</p>
            <p className={variant === "dark" ? "text-sm text-[color:color-mix(in_srgb,var(--sand)_78%,transparent)]" : "text-sm text-foreground/90"}>
              {wellness.texture.summary}
            </p>
          </div>
          <FaceZoneDiagram activeZones={zones} variant={variant} />
        </div>
      ) : null}

      {rec && kit && showRecCard ? <ProductRecommendationCard recName={rec.name} recNote={rec.note} kit={kit} variant={variant} /> : null}

      <div>
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${profileMuted}`}>{t("skin_scan_narrative_label")}</p>
        <p className={narrativeClass}>{aiRecommendation}</p>
      </div>

      <RoutineStepCards hints={routineHints} variant={variant} />

      {wellness ? (
        <div
          className={
            variant === "dark"
              ? "space-y-4 border-t border-[color:color-mix(in_srgb,var(--hermes)_28%,transparent)] pt-6"
              : "space-y-4 border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] pt-6"
          }
        >
          <div className="space-y-1">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--hermes)]`}>
              {t("skin_scan_passport_kicker")}
            </p>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${profileMuted}`}>{t("skin_scan_holistic_label")}</p>
          </div>
          <WellnessInfographicCards wellness={wellness} variant={variant} />
          <div
            className={
              variant === "dark"
                ? "grid gap-3 rounded-[18px] border border-[color:color-mix(in_srgb,var(--espresso)_25%,transparent)] bg-[#0c0a09] p-4 text-sm text-[color:color-mix(in_srgb,var(--sand)_76%,transparent)]"
                : "grid gap-3 rounded-[18px] border border-border bg-[color:color-mix(in_srgb,var(--surface-strong)_92%,transparent)] p-4 text-sm"
            }
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--hermes)]">{t("skin_scan_skincare_detail")}</p>
            <p>{wellness.skincare.routine}</p>
            <p className="text-xs opacity-85">Cleansing · {wellness.skincare.cleansingFrequency}</p>
            <p className="text-xs opacity-85">Actives · {wellness.skincare.actives}</p>
          </div>
          {wellness.casaKiliceMultiUse ? (
            <div
              className={
                variant === "dark"
                  ? "rounded-[18px] border border-[color:color-mix(in_srgb,rgba(232,208,102)_28%,transparent)] bg-[color:color-mix(in_srgb,#12100e_95%,transparent)] p-4 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--sand)_80%,transparent)]"
                  : "rounded-[18px] border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_94%,transparent)] p-4 text-sm"
              }
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--hermes)]">{t("skin_scan_multiuse_label")}</p>
              <p className="mt-2">{wellness.casaKiliceMultiUse}</p>
            </div>
          ) : null}
          <div
            className={
              variant === "dark"
                ? "grid gap-2 rounded-[18px] border border-[color:color-mix(in_srgb,var(--espresso)_25%,transparent)] bg-[#0c0a09] p-4 text-sm text-[color:color-mix(in_srgb,var(--sand)_74%,transparent)]"
                : "grid gap-2 rounded-[18px] border border-border bg-[color:color-mix(in_srgb,var(--surface-strong)_92%,transparent)] p-4 text-sm"
            }
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--hermes)]">{t("skin_scan_signals_label")}</p>
            <p className="text-xs">{wellness.signals.elasticity}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--hermes)]">{t("skin_scan_uv_label")}</p>
            <p className="text-xs">{wellness.sunSafety.uvIndexContext}</p>
            <p className="text-xs opacity-90">
              {t("skin_scan_nutrition_label")} · {wellness.lifestyle.nutrition}
            </p>
          </div>
        </div>
      ) : null}

      <MedicalDisclaimerStrip
        className={
          variant === "dark"
            ? "border-[color:color-mix(in_srgb,var(--espresso)_30%,transparent)] bg-[color:color-mix(in_srgb,#141110_85%,transparent)] text-[color:color-mix(in_srgb,var(--sand)_75%,transparent)]"
            : ""
        }
      />

      {footerSlot ? <div className="pt-2">{footerSlot}</div> : null}
    </div>
  );
}
