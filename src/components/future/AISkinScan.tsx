"use client";

import { AssetSvg } from "@/components/AssetSvg";
import { AnimatePresence, motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { useMood } from "@/components/future/MoodProvider";
import { productAssetPath } from "@/lib/productMedia";
import { productDefs } from "@/lib/products";
import type { ConciergePrefs } from "@/components/future/prefs";
import { loadPrefs, savePrefs } from "@/components/future/prefs";
import { DigitalPassportPanel } from "@/components/kilice/DigitalPassportPanel";
import { useI18n } from "@/i18n/LanguageProvider";
import type { StylingProfile, WellnessProtocol } from "@/lib/skinScan/types";

type Recommendation = {
  id: string;
  name: string;
  note: string;
  image: string;
};

function recFromSlug(slug: string): Recommendation | null {
  const def = productDefs.find((p) => p.slug === slug);
  if (!def) return null;
  const base =
    def.tone === "light" ? "light-cream" : def.tone === "bronzer" ? "bronzer-cream" : "deep-cream";
  return {
    id: def.slug,
    name: def.name,
    note: def.subtitle,
    image: productAssetPath(base),
  };
}

type ScanDetail = {
  undertone: string;
  depth: string;
  routineHints: string[];
  aiRecommendation: string;
  analysisSource: string;
  wellness?: WellnessProtocol;
  styling?: StylingProfile;
};

export function AISkinScan({ onAddToCart }: { onAddToCart?: (id: string) => void }) {
  const { t } = useI18n();
  const { mood } = useMood();
  const { data } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userKey = data?.user?.email ?? undefined;
  const [prefs, setPrefs] = useState<ConciergePrefs>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [detail, setDetail] = useState<ScanDetail | null>(null);
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
    (async () => {
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

  const name = prefs.name ?? data?.user?.name ?? "Darling";

  const greeting = useMemo(() => {
    if (!clientReady) {
      return "Welcome. Choose your focus, add an optional portrait, and start your scan for a vision-guided Casa Kilicé ritual.";
    }
    const last = prefs.lastRecommendedId;
    const r = last ? recFromSlug(last) : null;
    const lastName = r?.name ?? "your Casa Kilicé duo";
    return `Welcome back, ${name}. ${last ? `Your last edit centred on ${lastName}.` : "Upload a portrait for a vision-guided ritual."}`;
  }, [clientReady, name, prefs.lastRecommendedId]);

  const startScan = async () => {
    setScanning(true);
    setRec(null);
    setDetail(null);

    const file = fileInputRef.current?.files?.[0] ?? null;

    try {
      if (!userKey) {
        const local = recFromSlug(
          mood === "moon" ? "velvet-noir-duo" : mood === "sparkle" ? "luminous-ivory-duo" : "soleil-bronze-duo",
        );
        if (local) {
          setRec(local);
          setDetail({
            undertone: "Warm",
            depth: "Medium",
            routineHints: ["Sign in to save your consultation and unlock full AI analysis with your photo."],
            aiRecommendation:
              "Sign in to let the Casa Kilicé concierge read your skin with vision and archive a bespoke routine to your profile.",
            analysisSource: "guest",
          });
        }
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
        setDetail({
          undertone: "—",
          depth: "—",
          routineHints: ["We could not complete the scan. Try again, or upload a clear JPG/PNG selfie."],
          aiRecommendation: "Something interrupted the ritual. Please try again in a moment.",
          analysisSource: "error",
        });
        return;
      }

      const json = (await res.json()) as {
        recommendedId: string;
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

      setDetail({
        undertone: json.undertone ?? "—",
        depth: json.depth ?? "—",
        routineHints: Array.isArray(json.routineHints) ? json.routineHints : [],
        aiRecommendation: json.aiRecommendation ?? "",
        analysisSource: json.analysisSource ?? "heuristic",
        wellness: json.wellness,
        styling: json.styling,
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-[28px] border border-border bg-[color:var(--surface)] p-6">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">AI Beauty Concierge</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">{t("skin_scan_page_title")}</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-muted">{t("skin_scan_page_subtitle")}</p>
        <p className="mt-3 text-sm text-muted">{greeting}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{t("skin_scan_page_description")}</p>
        <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-muted">{t("skin_scan_designed_by")}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr,220px] md:items-center">
          <label className="group relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-[22px] border border-border bg-[color:var(--surface-strong)] px-5 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFileName(f?.name ?? null);
              }}
            />
            <div className="flex items-center gap-3 text-sm text-foreground/90">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[color:var(--surface)]">
                <Upload size={16} />
              </span>
              <div className="text-left">
                <p className="text-sm">Upload a clear selfie (optional but best)</p>
                <p className="text-xs text-muted">
                  {fileName ? fileName : "JPG / PNG / WebP — used for vision analysis when signed in"}
                </p>
              </div>
            </div>
          </label>

          <div className="grid gap-3">
            <input
              value={prefs.name ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setPrefs((p) => {
                  const next = { ...p, name: v || undefined };
                  savePrefs(userKey, next);
                  return next;
                });
              }}
              placeholder="Your name (to personalize)"
              className="h-11 w-full rounded-full border border-border bg-[color:var(--surface-strong)] px-5 text-sm outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--hermes)_45%,transparent)]"
            />
            <div className="flex gap-2">
              {(["glow", "hydration", "tone"] as const).map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => {
                    setPrefs((p) => {
                      const next = { ...p, skinFocus: x };
                      savePrefs(userKey, next);
                      if (userKey) {
                        fetch("/api/concierge/profile", {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ skinFocus: x }),
                        }).catch(() => null);
                      }
                      return next;
                    });
                  }}
                  className={[
                    "h-10 flex-1 rounded-full border border-border bg-[color:var(--surface-strong)] text-[11px] tracking-[0.22em] uppercase",
                    prefs.skinFocus === x
                      ? "border-[color:var(--hermes)] text-foreground"
                      : "text-muted transition-colors duration-500 hover:border-[color:var(--hermes)]",
                  ].join(" ")}
                >
                  {x}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ck-metallic inline-flex h-11 w-full items-center justify-center rounded-full px-6 text-xs tracking-[0.22em] uppercase"
              onClick={() => void startScan()}
              disabled={scanning}
            >
              {scanning ? "Scanning…" : "Start Scan"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {scanning ? (
          <motion.div
            key="scan"
            className="rounded-[28px] border border-border bg-[color:var(--surface)] p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.28em] uppercase text-muted">Scanning…</p>
            <motion.div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[color:var(--surface-strong)]">
              <motion.div
                className="h-full w-1/2 rounded-full bg-[color:color-mix(in_srgb,var(--hermes)_75%,var(--gold)_25%)]"
                animate={{ x: ["-60%", "160%"] }}
                transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.div>
            <p className="mt-4 text-sm text-muted">
              Reading undertone, depth, texture, hydration cues, and mapping to your Casa Kilicé duo…
            </p>
          </motion.div>
        ) : null}

        {!scanning && rec ? (
          <motion.div
            key="rec"
            className="overflow-hidden rounded-[28px] border border-border bg-[color:var(--surface)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="p-6">
              <p className="text-xs tracking-[0.22em] uppercase text-muted">Your Casa Kilicé edit</p>
              {detail ? (
                <div className="mt-4 border-t border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] pt-5">
                  <DigitalPassportPanel
                    variant="light"
                    undertone={detail.undertone}
                    depth={detail.depth}
                    analysisSource={detail.analysisSource}
                    aiRecommendation={detail.aiRecommendation}
                    routineHints={detail.routineHints}
                    wellness={detail.wellness}
                    styling={detail.styling}
                    skinFocus={prefs.skinFocus ?? null}
                    rec={{ id: rec.id, name: rec.name, note: rec.note, image: rec.image }}
                    footerSlot={
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          className="ck-metallic inline-flex h-11 items-center justify-center rounded-full px-6 text-xs tracking-[0.22em] uppercase"
                          onClick={() => onAddToCart?.(rec.id)}
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-[color:var(--surface-strong)] px-6 text-xs tracking-[0.22em] uppercase text-foreground transition-colors duration-500 hover:border-[color:var(--hermes)]"
                          onClick={() => void startScan()}
                        >
                          Re-scan
                        </button>
                      </div>
                    }
                  />
                </div>
              ) : (
                <>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">{rec.name}</p>
                  <p className="mt-2 text-sm text-muted">{rec.note}</p>
                  <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[22px] bg-[color:color-mix(in_srgb,var(--surface-strong)_88%,var(--background)_12%)]">
                    <AssetSvg src={rec.image} alt={rec.name} className="absolute inset-0 h-full w-full" fit="slice" />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      className="ck-metallic inline-flex h-11 items-center justify-center rounded-full px-6 text-xs tracking-[0.22em] uppercase"
                      onClick={() => onAddToCart?.(rec.id)}
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-[color:var(--surface-strong)] px-6 text-xs tracking-[0.22em] uppercase text-foreground transition-colors duration-500 hover:border-[color:var(--hermes)]"
                      onClick={() => void startScan()}
                    >
                      Re-scan
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
