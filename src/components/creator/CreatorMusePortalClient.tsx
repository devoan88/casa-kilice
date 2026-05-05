"use client";

import Link from "next/link";
import { Gift, Percent, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { assetUrl } from "@/lib/assetUrl";
import { trackCreatorUploadSubmitted } from "@/lib/analytics";
import { incrementMuseUploads, upsertMuseMarketingProfile } from "@/lib/creatorMuseStore";
import { useI18n } from "@/i18n/LanguageProvider";

const SESSION_KEY = "ck_muse_session_v2";
const POINTS_TARGET = 500;
const POINTS_PER_APPROVED = 40;

type MuseSession = {
  email: string;
  displayName?: string;
  points: number;
  approvedVideos: number;
};

const MUSE_BG = "#DCCFBF";
const MUSE_INK = "#3C3530";

function readSession(): MuseSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MuseSession;
  } catch {
    return null;
  }
}

function writeSession(s: MuseSession | null) {
  if (typeof window === "undefined") return;
  if (!s) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function CreatorMusePortalClient() {
  const { t } = useI18n();
  const [session, setSession] = useState<MuseSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSession(readSession());
    setHydrated(true);
  }, []);

  const persist = useCallback((s: MuseSession | null) => {
    writeSession(s);
    setSession(s);
  }, []);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em || !password) return;
    const existing = readSession();
    if (existing && existing.email === em) {
      persist(existing);
      return;
    }
    const next: MuseSession = {
      email: em,
      displayName: em.split("@")[0],
      points: 120,
      approvedVideos: 2,
    };
    persist(next);
    upsertMuseMarketingProfile({
      email: em,
      displayName: next.displayName,
      marketingOptIn: true,
      uploadsTotal: 0,
    });
  };

  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em || !password) return;
    const next: MuseSession = {
      email: em,
      displayName: displayName.trim() || undefined,
      points: 80,
      approvedVideos: 1,
    };
    persist(next);
    upsertMuseMarketingProfile({
      email: em,
      displayName: next.displayName,
      marketingOptIn: true,
      uploadsTotal: 0,
    });
  };

  const onSignOut = () => {
    persist(null);
    setPassword("");
    setFiles([]);
    setSent(false);
  };

  const addFiles = (list: FileList | File[]) => {
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 24));
    setSent(false);
  };

  const onSubmitUpload = () => {
    if (!session || files.length === 0) return;
    const added = files.length * POINTS_PER_APPROVED;
    const next: MuseSession = {
      ...session,
      points: session.points + added,
      approvedVideos: session.approvedVideos + files.length,
    };
    persist(next);
    incrementMuseUploads(session.email, files.length);
    trackCreatorUploadSubmitted(files.length);
    setFiles([]);
    setSent(true);
  };

  const fieldClass =
    "mt-1 w-full border-0 border-b py-2.5 text-sm outline-none transition placeholder:opacity-50 focus:border-opacity-100";
  const fieldStyle = {
    borderColor: `color-mix(in srgb, ${MUSE_INK} 22%, transparent)`,
    color: MUSE_INK,
    backgroundColor: "transparent",
  } as const;

  const pct = session ? Math.min(100, (session.points / POINTS_TARGET) * 100) : 0;

  if (!hydrated) {
    return <div className="min-h-[40vh]" style={{ backgroundColor: MUSE_BG }} aria-hidden />;
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] pb-16 pt-8 md:pt-10" style={{ backgroundColor: MUSE_BG, color: MUSE_INK }}>
      <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
        <header className="flex flex-col items-center border-b pb-8 text-center" style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 12%, transparent)` }}>
          <Link href="/" className="inline-block max-w-[118px] md:max-w-[128px]" aria-label="Casa Kilicé — home">
            <img
              src={assetUrl("/assets/casa-kilicepublicbrandlogo.svg.jpeg")}
              alt=""
              decoding="async"
              className="h-auto w-full"
            />
          </Link>
          <p className="mt-4 font-sans text-[9px] font-medium uppercase tracking-[0.32em]" style={{ color: `color-mix(in srgb, ${MUSE_INK} 52%, transparent)` }}>
            {t("muse_hero_kicker")}
          </p>
        </header>

        <p
          className="mx-auto mt-6 max-w-xl text-center font-[family-name:var(--font-georgian)] text-[15px] leading-relaxed md:text-[17px]"
          style={{ color: MUSE_INK }}
        >
          {t("muse_ugc_tagline")}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-center font-sans text-[10px] uppercase tracking-[0.22em] opacity-70">
          <Link href="/muse-join" className="underline underline-offset-4 hover:opacity-100">
            Secure Muse registration
          </Link>
          <span aria-hidden> · </span>
          <Link href="/muse-dashboard" className="underline underline-offset-4 hover:opacity-100">
            Dashboard
          </Link>
        </p>

        {!session ? (
          <div className="mx-auto mt-8 max-w-md">
            <div className="flex border-b" style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 12%, transparent)` }}>
              <button
                type="button"
                onClick={() => setTab("login")}
                className="flex-1 py-3 font-sans text-[10px] font-medium uppercase tracking-[0.24em]"
                style={{
                  borderBottom: tab === "login" ? `2px solid ${MUSE_INK}` : "2px solid transparent",
                  opacity: tab === "login" ? 1 : 0.45,
                }}
              >
                {t("muse_tab_login")}
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className="flex-1 py-3 font-sans text-[10px] font-medium uppercase tracking-[0.24em]"
                style={{
                  borderBottom: tab === "register" ? `2px solid ${MUSE_INK}` : "2px solid transparent",
                  opacity: tab === "register" ? 1 : 0.45,
                }}
              >
                {t("muse_tab_register")}
              </button>
            </div>
            {tab === "login" ? (
              <form onSubmit={onLogin} className="mt-6 space-y-4">
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">
                  {t("muse_email")}
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} style={fieldStyle} />
                </label>
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">
                  {t("muse_password")}
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} style={fieldStyle} />
                </label>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full border py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.26em] transition hover:opacity-90"
                  style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 22%, transparent)`, backgroundColor: `color-mix(in srgb, #fff 40%, transparent)` }}
                >
                  {t("muse_submit_login")}
                </button>
              </form>
            ) : (
              <form onSubmit={onRegister} className="mt-6 space-y-4">
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">
                  {t("muse_email")}
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} style={fieldStyle} />
                </label>
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">
                  {t("muse_password")}
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} style={fieldStyle} />
                </label>
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">
                  {t("muse_name_optional")}
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={fieldClass} style={fieldStyle} />
                </label>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full border py-3.5 font-sans text-[10px] font-medium uppercase tracking-[0.26em] transition hover:opacity-90"
                  style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 22%, transparent)`, backgroundColor: `color-mix(in srgb, #fff 40%, transparent)` }}
                >
                  {t("muse_submit_register")}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">{t("muse_dashboard_title")}</h2>
                  <p className="mt-1 text-sm opacity-70">{session.displayName ?? session.email}</p>
                </div>
                <button type="button" onClick={onSignOut} className="shrink-0 font-sans text-[10px] uppercase tracking-[0.2em] underline-offset-4 hover:underline">
                  {t("muse_sign_out")}
                </button>
              </div>

              <div className="rounded-2xl border p-5" style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 14%, transparent)`, backgroundColor: `color-mix(in srgb, #fff 35%, transparent)` }}>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.26em] opacity-55">{t("muse_points_label")}</p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-4xl tabular-nums">{session.points}</p>
                  </div>
                  <span className="pb-1 font-sans text-[9px] uppercase tracking-[0.18em] opacity-50">{t("muse_points_target_note")}</span>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${MUSE_INK} 10%, transparent)` }}>
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, backgroundColor: MUSE_INK }} />
                </div>
                <p className="mt-3 text-xs leading-relaxed opacity-75">{t("muse_points_hint")}</p>
                <p className="mt-2 text-[10px] opacity-50">{t("muse_demo_note")}</p>
              </div>

              <section>
                <h3 className="font-[family-name:var(--font-display)] text-lg">{t("muse_upload_title")}</h3>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition-colors"
                  style={{
                    borderColor: dragOver ? `color-mix(in srgb, ${MUSE_INK} 40%, transparent)` : `color-mix(in srgb, ${MUSE_INK} 18%, transparent)`,
                    backgroundColor: dragOver ? `color-mix(in srgb, #fff 55%, transparent)` : `color-mix(in srgb, #fff 28%, transparent)`,
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    className="sr-only"
                    accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,.mov"
                    multiple
                    onChange={(e) => {
                      if (e.target.files?.length) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em]">{t("muse_upload_drop")}</span>
                  <span className="mt-2 text-xs opacity-60">{t("muse_upload_types")}</span>
                </div>
                {files.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {files.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="flex justify-between gap-2 opacity-85">
                        <span className="truncate">{f.name}</span>
                        <span className="shrink-0 text-xs opacity-60">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={files.length === 0}
                    onClick={onSubmitUpload}
                    className="rounded-full px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-[#F5F0E8] transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                    style={{ backgroundColor: MUSE_INK }}
                  >
                    {t("muse_upload_submit")}
                  </button>
                  <button
                    type="button"
                    disabled={files.length === 0}
                    onClick={() => {
                      setFiles([]);
                      setSent(false);
                    }}
                    className="rounded-full border px-4 py-2.5 font-sans text-[10px] font-medium uppercase tracking-[0.2em] transition enabled:hover:bg-white/20 disabled:opacity-35"
                    style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 20%, transparent)` }}
                  >
                    {t("muse_upload_clear")}
                  </button>
                </div>
                {sent ? <p className="mt-3 text-sm font-medium">{t("muse_upload_sent")}</p> : null}
              </section>
            </div>

            <aside className="space-y-6">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg">{t("muse_rewards_title")}</h3>
                <ul className="mt-3 space-y-3">
                  {[
                    { Icon: Gift, t: t("muse_reward_birthday"), d: t("muse_reward_birthday_sub") },
                    { Icon: Percent, t: t("muse_reward_discount"), d: t("muse_reward_discount_sub") },
                    { Icon: Sparkles, t: t("muse_reward_limited"), d: t("muse_reward_limited_sub") },
                  ].map(({ Icon, t: title, d }) => (
                    <li
                      key={title}
                      className="flex gap-3 rounded-xl border p-3"
                      style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 12%, transparent)`, backgroundColor: `color-mix(in srgb, #fff 30%, transparent)` }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 15%, transparent)` }}>
                        <Icon size={18} strokeWidth={1.35} />
                      </span>
                      <div>
                        <p className="font-[family-name:var(--font-display)] text-sm leading-tight">{title}</p>
                        <p className="mt-1 text-[11px] leading-snug opacity-65">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.28em] opacity-50">{t("muse_grid_kicker")}</p>
                <div className="mt-3 grid grid-cols-3 gap-2" aria-label={t("muse_grid_aria")}>
                  {[
                    { bg: "linear-gradient(145deg,#c4a574,#8b6544)", cap: t("muse_card_a_caption") },
                    { bg: "linear-gradient(145deg,#b8835c,#6a3d28)", cap: t("muse_card_b_caption") },
                    { bg: "linear-gradient(145deg,#6b4530,#3a2418)", cap: t("muse_card_c_caption") },
                  ].map((c) => (
                    <figure key={c.cap} className="overflow-hidden rounded-lg border text-left" style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 10%, transparent)` }}>
                      <div className="aspect-square w-full" style={{ background: c.bg }} />
                      <figcaption className="px-1.5 py-1.5 font-sans text-[8px] uppercase tracking-[0.14em] opacity-70">{c.cap}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        <section
          className="mx-auto mt-14 max-w-2xl rounded-2xl border px-5 py-6 text-center"
          style={{ borderColor: `color-mix(in srgb, ${MUSE_INK} 12%, transparent)`, backgroundColor: `color-mix(in srgb, #fff 25%, transparent)` }}
        >
          <p className="font-[family-name:var(--font-display)] text-xl tracking-tight md:text-2xl">{t("muse_cta_line")}</p>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed opacity-70">{t("muse_cta_sub")}</p>
        </section>
      </div>
    </div>
  );
}
