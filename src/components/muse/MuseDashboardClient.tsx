"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";

import type { MusePendingCelebrationPayload } from "@/lib/muse/celebrationMessages";
import { formatMuseCelebrationKa, parseMusePendingCelebration } from "@/lib/muse/celebrationMessages";
import {
  computeMuseTierProgress,
  MUSE_MILESTONES,
  MUSE_REWARD_MAX_POINTS,
  milestoneReached,
} from "@/lib/muse/rewardTiers";

export type MuseDashboardUpload = {
  id: string;
  status: string;
  type: string;
  fileUrl: string;
  displayName: string;
  pointsAwarded: number;
  createdAt: string;
};

export type MuseDashboardInitial = {
  name: string | null;
  email: string | null;
  points: number;
  isMuse: boolean;
  museStatus: string | null;
  museDiscountCode15: string | null;
  museBirthdayBoxFlag: boolean;
  museFreeShipping: boolean;
  musePendingCelebration: string | null;
  uploads: MuseDashboardUpload[];
};

export function MuseDashboardClient({ initial }: { initial: MuseDashboardInitial }) {
  const router = useRouter();
  const [uploads, setUploads] = useState(initial.uploads);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [celebration, setCelebration] = useState<MusePendingCelebrationPayload | null>(() =>
    parseMusePendingCelebration(initial.musePendingCelebration),
  );
  const [celebrationOpen, setCelebrationOpen] = useState(() =>
    Boolean(parseMusePendingCelebration(initial.musePendingCelebration)),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const tier = computeMuseTierProgress(initial.points);

  useEffect(() => {
    const parsed = parseMusePendingCelebration(initial.musePendingCelebration);
    setCelebration(parsed);
    setCelebrationOpen(Boolean(parsed));
  }, [initial.musePendingCelebration]);

  const dismissCelebration = useCallback(async () => {
    try {
      const res = await fetch("/api/muse/celebration/dismiss", { method: "POST" });
      if (res.ok) {
        setCelebration(null);
        setCelebrationOpen(false);
        router.refresh();
      }
    } catch {
      setCelebrationOpen(false);
    }
  }, [router]);

  const ingestFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setMessage(null);
      setError(null);
      setUploading(true);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/muse/upload", { method: "POST", body: fd });
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          upload?: MuseDashboardUpload;
        };
        if (!res.ok || !json.ok || !json.upload) {
          setError(json?.error ?? "Upload failed.");
          return;
        }
        setUploads((prev) => [json.upload!, ...prev]);
        setMessage(
          "Received — status Pending. Photo approvals earn 5 points; video approvals earn 15 — only after house review.",
        );
        router.refresh();
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [router],
  );

  const celebrationText = celebration ? formatMuseCelebrationKa(celebration) : "";

  return (
    <div className="relative min-h-[72vh] bg-[color:var(--sand)] pb-28 pt-10 md:pt-14">
      {celebration && celebrationOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:rgba(60,53,48,0.42)] px-4 py-10 backdrop-blur-[2px]"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="muse-celebration-title"
            className="relative max-h-[min(90vh,540px)] w-full max-w-lg overflow-y-auto rounded-[1.25rem] border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] p-7 shadow-[0_28px_80px_rgba(40,35,30,0.35)] md:p-9"
          >
            <p id="muse-celebration-title" className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
              Casa Kilicé Muse
            </p>
            <p className="mt-4 font-[family-name:var(--font-georgian)] text-[1.05rem] leading-[1.65] text-[color:var(--espresso)] md:text-[1.12rem]">
              {celebrationText}
            </p>
            {celebration.discountCode ? (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <code className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:var(--sand-soft)] px-3 py-2 text-sm font-medium tracking-wide text-[color:var(--espresso)]">
                  {celebration.discountCode}
                </code>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(celebration.discountCode ?? "")}
                  className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] hover:border-[color:var(--hermes)]"
                >
                  Copy code
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void dismissCelebration()}
              className="mt-8 w-full rounded-full bg-[color:var(--espresso)] py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--surface)]"
            >
              დახურვა
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:color-mix(in_srgb,var(--espresso)_72%,#555)] underline-offset-4 transition-colors hover:text-[color:var(--hermes)] hover:underline"
          >
            ← Back to home
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/muse-join" })}
            className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted hover:text-[color:var(--hermes)]"
          >
            Sign out
          </button>
        </div>

        <header className="mt-10 border-b border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] pb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">Muse dashboard</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--espresso)]">
              {initial.name?.trim() || "Welcome"}
            </h1>
            {initial.isMuse ? (
              <span className="mb-1 rounded-full border border-[color:color-mix(in_srgb,var(--hermes)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_90%,transparent)] px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)]">
                Muse member{initial.museStatus ? ` · ${initial.museStatus}` : ""}
              </span>
            ) : (
              <span className="mb-1 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
                Standard account
              </span>
            )}
          </div>
          {initial.email ? <p className="mt-1 text-sm text-muted">{initial.email}</p> : null}
        </header>

        {initial.museDiscountCode15 || initial.museBirthdayBoxFlag || initial.museFreeShipping ? (
          <section className="mt-6 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_96%,#fff)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">თქვენი სარგებელი</p>
            <ul className="mt-3 space-y-2 font-[family-name:var(--font-georgian)] text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_88%,#2c2824)]">
              {initial.museDiscountCode15 ? (
                <li>
                  <span className="font-semibold">15%-იანი კოდი: </span>
                  <code className="rounded bg-[color:var(--sand-soft)] px-1.5 py-0.5">{initial.museDiscountCode15}</code>
                </li>
              ) : null}
              {initial.museBirthdayBoxFlag ? (
                <li>
                  <span className="font-semibold">Birthday Box: </span>მიწოდება მონიშნულია (Gold+).
                </li>
              ) : null}
              {initial.museFreeShipping ? (
                <li>
                  <span className="font-semibold">მიწოდება: </span>უფასო მიწოდება ჩართულია (Elite).
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}

        <section className="mt-10 rounded-[clamp(1rem,2vw,1.25rem)] border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_94%,#fff)] p-6 shadow-[0_14px_40px_rgba(60,53,48,0.06)] md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Point balance</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tabular-nums text-[color:var(--espresso)]">
            {initial.points}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_78%,#444)]">
            {tier.allUnlocked ? (
              <>You have reached the top milestone — thank you for stewarding the maison.</>
            ) : (
              <>
                <span className="font-semibold text-[color:var(--espresso)]">{tier.pointsUntilNext}</span> points
                until <span className="font-medium">{tier.nextTitle}</span> ({tier.nextAt} pts)
              </>
            )}
          </p>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[9px] font-medium uppercase tracking-[0.18em] text-muted">
              <span>0</span>
              <span>{MUSE_REWARD_MAX_POINTS} max track</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--espresso)] to-[color:var(--hermes)] transition-[width] duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, tier.axisPct))}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--espresso)]">
            Reward milestones
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {MUSE_MILESTONES.map((m) => {
              const ok = milestoneReached(initial.points, m.at);
              return (
                <li
                  key={m.at}
                  className={`rounded-xl border px-4 py-4 text-sm leading-snug ${
                    ok
                      ? "border-[color:color-mix(in_srgb,var(--hermes)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_88%,#fff)]"
                      : "border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_96%,#fff)] opacity-[0.92]"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{m.at} pts</p>
                  <p className="mt-1.5 font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--espresso)]">
                    {m.shortTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted">{m.detail}</p>
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--hermes)]">
                    {ok ? "Unlocked" : "Locked"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--espresso)]">
            Secure upload
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Drag a file here or browse. Stored under a private path on our servers — never public until approved.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => void ingestFile(e.target.files?.[0] ?? null)}
          />
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
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              void ingestFile(f ?? null);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-5 flex min-h-[9.5rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
              dragOver
                ? "border-[color:var(--hermes)] bg-[color:color-mix(in_srgb,var(--hermes)_08%,var(--sand-soft))]"
                : "border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] hover:border-[color:color-mix(in_srgb,var(--espresso)_28%,transparent)]"
            }`}
          >
            <p className="text-sm font-medium text-[color:var(--espresso)]">
              {uploading ? "Uploading…" : "Drop image or video"}
            </p>
            <p className="mt-1 text-xs text-muted">JPEG, PNG, WebP, GIF, MP4, WebM, MOV — max 45 MB</p>
          </div>
          {message ? <p className="mt-3 text-sm text-[color:color-mix(in_srgb,var(--espresso)_82%,#333)]">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-800/90">{error}</p> : null}
        </section>

        <section className="mt-12">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--espresso)]">
            Your submissions
          </h2>
          <ul className="mt-4 divide-y divide-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_96%,#fff)]">
            {uploads.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted">No uploads yet.</li>
            ) : (
              uploads.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="font-medium text-[color:var(--espresso)]">{u.displayName}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {u.type} · {u.status}
                    {u.pointsAwarded > 0 ? ` · +${u.pointsAwarded} pts` : ""}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
