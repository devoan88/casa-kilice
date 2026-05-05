"use client";

import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { ScanLightGrid } from "@/components/portal/ScanLightGrid";
import { DigitalPassportPanel } from "@/components/kilice/DigitalPassportPanel";
import { useMood } from "@/components/future/MoodProvider";
import type { ConciergePrefs } from "@/components/future/prefs";
import { loadPrefs, savePrefs } from "@/components/future/prefs";
import { useI18n } from "@/i18n/LanguageProvider";
import { productAssetPath } from "@/lib/productMedia";
import { productDefs } from "@/lib/products";
import type { StylingProfile, WellnessProtocol } from "@/lib/skinScan/types";

import glowAnimation from "./kilice-glow.json";

type Rec = { id: string; name: string; note: string; image: string };

function recFromSlug(slug: string): Rec | null {
  const def = productDefs.find((p) => p.slug === slug);
  if (!def) return null;
  const base =
    def.tone === "light" ? "light-cream" : def.tone === "bronzer" ? "bronzer-cream" : "deep-cream";
  return { id: def.slug, name: def.name, note: def.subtitle, image: productAssetPath(base) };
}

type Passport = {
  undertone: string;
  depth: string;
  routineHints: string[];
  aiRecommendation: string;
  analysisSource: string;
  wellness?: WellnessProtocol;
  styling?: StylingProfile;
  consultationId: string | null;
};

export function AiProtocolClient() {
  const { t, locale } = useI18n();
  const { mood } = useMood();
  const { data } = useSession();
  const userKey = data?.user?.email ?? undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Empty until mounted — `loadPrefs` uses localStorage and must not run during SSR initial state (hydration mismatch on skin-focus chips). */
  const [prefs, setPrefs] = useState<ConciergePrefs>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [rec, setRec] = useState<Rec | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  /** Session / localStorage differ SSR vs client — defer personalized copy until mounted. */
  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setPrefs(loadPrefs(userKey));
  }, [userKey]);

  useEffect(() => {
    if (!userKey) return;
    let alive = true;
    void (async () => {
      const res = await fetch("/api/concierge/profile", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as {
        preferredName: string | null;
        skinFocus: string | null;
        lastRecommendedId: string | null;
      };
      if (!alive) return;
      setPrefs((p) => ({
        ...p,
        name: json.preferredName ?? p.name,
        skinFocus: (json.skinFocus as typeof prefs.skinFocus) ?? p.skinFocus,
        lastRecommendedId: json.lastRecommendedId ?? p.lastRecommendedId,
      }));
    })();
    return () => {
      alive = false;
    };
  }, [userKey]);

  const name = prefs.name ?? data?.user?.name ?? "Guest";

  const greeting = useMemo(() => {
    const displayName = clientReady ? name : "Guest";
    return t("skin_scan_greeting", { name: displayName });
  }, [clientReady, name, t]);

  const onFileChange = useCallback(() => {
    const f = fileInputRef.current?.files?.[0];
    setFileName(f?.name ?? null);
    setHasFile(!!f && f.size > 0);
  }, []);

  const runProtocol = async () => {
    setScanning(true);
    setRec(null);
    setPassport(null);
    const file = fileInputRef.current?.files?.[0] ?? null;

    try {
      if (!userKey) {
        setPassport({
          undertone: "—",
          depth: "—",
          routineHints: [],
          aiRecommendation:
            "Sign in to run the full vision engine, archive your Digital Beauty Passport, and export a branded PDF.",
          analysisSource: "guest",
          consultationId: null,
        });
        return;
      }

      let res: Response;
      if (file && file.size > 0) {
        const fd = new FormData();
        fd.append("photo", file);
        fd.append("mood", mood);
        if (prefs.skinFocus) fd.append("skinFocus", prefs.skinFocus);
        res = await fetch("/api/concierge/scan", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/concierge/scan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mood, skinFocus: prefs.skinFocus ?? null }),
        });
      }

      if (!res.ok) {
        setPassport({
          undertone: "—",
          depth: "—",
          routineHints: ["The protocol could not complete. Try a clear JPG or WebP portrait, or retry shortly."],
          aiRecommendation: "The line was interrupted — please try again.",
          analysisSource: "error",
          consultationId: null,
        });
        return;
      }

      const json = (await res.json()) as {
        recommendedId: string;
        consultationId?: string;
        undertone?: string;
        depth?: string;
        routineHints?: string[];
        aiRecommendation?: string;
        analysisSource?: string;
        wellness?: WellnessProtocol;
        styling?: StylingProfile;
      };

      const picked = recFromSlug(json.recommendedId) ?? recFromSlug("luminous-ivory-duo");
      if (picked) {
        setRec(picked);
        setPrefs((p) => {
          const next = { ...p, lastRecommendedId: picked.id };
          savePrefs(userKey, next);
          return next;
        });
        await fetch("/api/concierge/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            preferredName: prefs.name ?? null,
            skinFocus: prefs.skinFocus ?? null,
            lastRecommendedId: picked.id,
          }),
        }).catch(() => null);
      }

      setPassport({
        undertone: json.undertone ?? "—",
        depth: json.depth ?? "—",
        routineHints: Array.isArray(json.routineHints) ? json.routineHints : [],
        aiRecommendation: json.aiRecommendation ?? "",
        analysisSource: json.analysisSource ?? "heuristic",
        wellness: json.wellness,
        styling: json.styling,
        consultationId: json.consultationId ?? null,
      });
    } finally {
      setScanning(false);
    }
  };

  const downloadPdf = async () => {
    if (!passport?.consultationId) return;
    setPdfBusy(true);
    try {
      const res = await fetch(`/api/concierge/protocol-pdf?consultationId=${encodeURIComponent(passport.consultationId)}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "casa-kilice-protocol.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfBusy(false);
    }
  };

  const titleFont =
    locale === "ka"
      ? "font-[family-name:var(--font-georgian)] font-semibold"
      : "font-[family-name:var(--font-display)] font-medium";

  return (
    <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-12 md:pt-16">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[color:color-mix(in_srgb,var(--hermes)_14%,transparent)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[color:color-mix(in_srgb,var(--gold)_12%,transparent)] blur-3xl" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-2xl rounded-[100%] bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--sand-soft)_14%,transparent),transparent_70%)] opacity-90"
        aria-hidden
      />

      <motion.header
        className="relative text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[color:color-mix(in_srgb,var(--sand)_55%,var(--espresso))]">
          {t("skin_scan_page_kicker")}
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-5 text-[clamp(2rem,5.5vw,3.5rem)] tracking-[0.02em] text-[color:var(--sand-soft)] ${titleFont}`}
        >
          {t("skin_scan_page_title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[color:color-mix(in_srgb,var(--sand)_78%,transparent)]"
        >
          {t("skin_scan_page_subtitle")}
        </motion.p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--sand)_72%,transparent)]">
          {greeting}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[color:color-mix(in_srgb,var(--sand)_58%,transparent)]">
          {t("skin_scan_page_description")}
        </p>
        <p className="mt-4 text-[9px] uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,var(--hermes)_75%,transparent)]">
          {t("skin_scan_designed_by")}
        </p>
      </motion.header>

      {/* Scan-dim overlay — dims everything behind the scanner panel */}
      <AnimatePresence>
        {(hasFile || scanning) ? (
          <motion.div
            key="scan-dim"
            className="pointer-events-none fixed inset-0 z-[14]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ background: "rgba(5, 4, 3, 0.65)" }}
          />
        ) : null}
      </AnimatePresence>

      <motion.section
        className="relative z-[16] mt-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onFileChange}
        />

        <ScanLightGrid active={hasFile || scanning} className="mx-auto w-full max-w-md rounded-[32px]">
          <motion.button
            type="button"
            layout
            onClick={() => fileInputRef.current?.click()}
            className={[
              "group relative mx-auto flex w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-[32px] border backdrop-blur-md transition-[box-shadow,border-color] duration-700",
              hasFile
                ? "border-[color:color-mix(in_srgb,var(--neon-amber)_55%,transparent)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--neon-amber)_35%,transparent),0_24px_80px_rgba(232,208,102,0.2)]"
                : "border-[color:color-mix(in_srgb,var(--espresso)_22%,transparent)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]",
            ].join(" ")}
            style={{
              background:
                "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--espresso) 42%, #1a1412) 0%, #0f0c0b 55%, #0a0908 100%)",
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
          >
          <div
            className={[
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100",
              hasFile ? "opacity-100" : "",
            ].join(" ")}
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in srgb, var(--hermes) 25%, transparent), transparent 70%)",
            }}
          />
          <div className="relative z-[1] flex flex-col items-center px-8 py-10">
            <div className="h-[140px] w-[140px]">
              <Lottie
                animationData={glowAnimation as object}
                loop
                className={hasFile ? "opacity-100 drop-shadow-[0_0_28px_color-mix(in_srgb,var(--hermes)_45%,transparent)]" : "opacity-80"}
              />
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-[0.32em] text-[color:color-mix(in_srgb,var(--sand)_58%,transparent)]">
              {hasFile ? t("skin_scan_upload_ready") : t("skin_scan_upload_hint")}
            </p>
            {fileName ? (
              <p className="mt-2 max-w-[260px] truncate text-xs text-[color:color-mix(in_srgb,var(--sand)_75%,transparent)]">
                {fileName}
              </p>
            ) : (
              <p className="mt-2 text-xs text-[color:color-mix(in_srgb,var(--sand)_45%,transparent)]">JPG · PNG · WebP</p>
            )}
          </div>
        </motion.button>
        </ScanLightGrid>

        <div className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-2">
          {(["glow", "hydration", "tone"] as const).map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => {
                setPrefs((p) => {
                  const next = { ...p, skinFocus: x };
                  savePrefs(userKey, next);
                  if (userKey) {
                    void fetch("/api/concierge/profile", {
                      method: "PATCH",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ skinFocus: x }),
                    });
                  }
                  return next;
                });
              }}
              className={[
                "rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.24em] transition-colors duration-500",
                prefs.skinFocus === x
                  ? "border-[color:var(--hermes)] bg-[color:color-mix(in_srgb,var(--hermes)_18%,transparent)] text-[color:var(--sand-soft)]"
                  : "border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)] text-[color:color-mix(in_srgb,var(--sand)_65%,transparent)] hover:border-[color:var(--hermes)]",
              ].join(" ")}
            >
              {x}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <motion.button
            type="button"
            disabled={scanning}
            onClick={() => void runProtocol()}
            className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--hermes)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--hermes)_22%,#1a1512)] px-8 text-[11px] font-medium uppercase tracking-[0.28em] text-[color:var(--sand-soft)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-opacity disabled:opacity-50"
            whileHover={{ scale: scanning ? 1 : 1.02 }}
          >
            {scanning ? t("skin_scan_run_loading") : t("skin_scan_run_cta")}
          </motion.button>
          {!userKey ? (
            <Link
              href="/account/sign-in"
              className="text-center text-[11px] uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,var(--hermes)_85%,transparent)] underline-offset-4 hover:underline"
            >
              Sign in for vision + PDF
            </Link>
          ) : null}
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {scanning ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="ck-spatial-panel ck-holo-sheen relative mt-16 rounded-[28px] p-8 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-[color:color-mix(in_srgb,var(--sand)_50%,transparent)]">
              {t("skin_scan_engine_loading_title")}
            </p>
            <p className="mt-3 text-sm text-[color:color-mix(in_srgb,var(--sand)_70%,transparent)]">
              {t("skin_scan_engine_loading_sub")}
            </p>
          </motion.div>
        ) : null}

        {!scanning && passport ? (
          <motion.div
            key="passport"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-16 space-y-8"
          >
            {passport.consultationId ? (
              <div className="relative overflow-hidden rounded-[28px] border-2 border-[color:color-mix(in_srgb,var(--hermes)_55%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,#1a1614_96%,#000)_0%,#0c0a09_45%,color-mix(in_srgb,var(--espresso)_22%,#080706)_100%)] p-6 shadow-[0_24px_80px_rgba(201,162,110,0.15),0_0_0_1px_color-mix(in_srgb,var(--hermes)_20%,transparent)] md:p-8">
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color:color-mix(in_srgb,var(--hermes)_22%,transparent)] blur-2xl"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--hermes)]">
                      {t("skin_scan_passport_kicker")}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--sand)_76%,transparent)]">
                      {t("skin_scan_pdf_blurb")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pdfBusy}
                    onClick={() => void downloadPdf()}
                    className="relative inline-flex min-h-[3.5rem] shrink-0 items-center justify-center rounded-full bg-[color:var(--sand-soft)] px-10 py-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#14110f] shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-2 ring-[color:color-mix(in_srgb,var(--hermes)_45%,transparent)] transition-transform hover:scale-[1.02] disabled:opacity-50 md:px-12"
                  >
                    {pdfBusy ? t("skin_scan_pdf_busy") : t("skin_scan_pdf_cta")}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="ck-spatial-panel ck-holo-sheen rounded-[28px] p-6 md:p-10">
              <div>
                <DigitalPassportPanel
                  variant="dark"
                  undertone={passport.undertone}
                  depth={passport.depth}
                  analysisSource={passport.analysisSource}
                  aiRecommendation={passport.aiRecommendation}
                  routineHints={passport.routineHints}
                  wellness={passport.wellness}
                  styling={passport.styling}
                  skinFocus={prefs.skinFocus ?? null}
                  rec={rec ? { id: rec.id, name: rec.name, note: rec.note, image: rec.image } : null}
                  footerSlot={
                    <Link
                      href="/business"
                      className="inline-flex text-[10px] uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,var(--hermes)_92%,transparent)] underline-offset-4 hover:underline"
                    >
                      {t("nav_business")} — $49 / $149 / $499
                    </Link>
                  }
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
