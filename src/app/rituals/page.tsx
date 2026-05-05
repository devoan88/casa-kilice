"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { useI18n } from "@/i18n/LanguageProvider";

type RitualState = {
  streak: number;
  lastDay: string;
};

function todayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

function ritualStorageKey(userKey: string) {
  return `ck_ritual_${userKey}`;
}

function loadRitual(userKey: string): RitualState {
  try {
    const raw = localStorage.getItem(ritualStorageKey(userKey));
    if (!raw) return { streak: 0, lastDay: "" };
    return JSON.parse(raw) as RitualState;
  } catch {
    return { streak: 0, lastDay: "" };
  }
}

function saveRitual(userKey: string, state: RitualState) {
  try {
    localStorage.setItem(ritualStorageKey(userKey), JSON.stringify(state));
  } catch {
    // ignore
  }
}

const RITUAL_BLOCKS = [
  {
    id: "morning",
    labelKey: "ritual_morning" as const,
    titleKey: "ritual_morning_title" as const,
    descKey: "ritual_morning_desc" as const,
  },
  {
    id: "midday",
    labelKey: "ritual_midday" as const,
    titleKey: "ritual_mid_title" as const,
    descKey: "ritual_mid_desc" as const,
  },
  {
    id: "evening",
    labelKey: "ritual_evening" as const,
    titleKey: "ritual_eve_title" as const,
    descKey: "ritual_eve_desc" as const,
  },
] as const;

export default function MyRitualsPage() {
  const { t, locale } = useI18n();
  const { data, status } = useSession();
  const signedIn = Boolean(data?.user?.email);
  const userKey = data?.user?.email ?? "";

  const [ritual, setRitual] = useState<RitualState>({ streak: 0, lastDay: "" });

  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    (async () => {
      const res = await fetch("/api/rituals", { method: "POST" });
      if (res.ok) {
        const json = (await res.json()) as { streak: number; lastDay: string };
        if (!alive) return;
        setRitual({ streak: json.streak, lastDay: json.lastDay });
        return;
      }

      const now = todayKey();
      const yesterday = yesterdayKey();

      const existing = loadRitual(userKey);
      if (existing.lastDay === now) {
        setRitual(existing);
        return;
      }

      const next: RitualState =
        existing.lastDay === yesterday
          ? { streak: Math.max(1, existing.streak + 1), lastDay: now }
          : { streak: 1, lastDay: now };

      saveRitual(userKey, next);
      setRitual(next);
    })();
    return () => {
      alive = false;
    };
  }, [signedIn, userKey]);

  const title = useMemo(() => {
    const n = ritual.streak || 0;
    const key = n === 1 ? "ritual_streak_one" : "ritual_streak_many";
    return t(key, { n });
  }, [ritual.streak, t, locale]);

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-sm text-muted">{t("ritual_loading")}</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">
          {t("ritual_kicker")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {t("ritual_signin_title")}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted md:text-base">
          {t("ritual_signin_body")}
        </p>
        <Link
          href="/account/sign-in"
          className="ck-metallic mt-8 inline-flex h-11 items-center justify-center rounded-full px-7 text-xs tracking-[0.22em] uppercase"
        >
          {t("ritual_signin_cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted">
        {t("ritual_kicker")}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-tight">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-muted md:text-base">
        {t("ritual_intro")}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {RITUAL_BLOCKS.map((c) => (
          <div
            key={c.id}
            className="rounded-[28px] border border-border bg-[color:var(--surface)] p-6 shadow-[0_18px_50px_rgba(45,27,27,0.1)]"
          >
            <p className="text-xs tracking-[0.22em] uppercase text-muted">
              {t(c.labelKey)}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
              {t(c.titleKey)}
            </p>
            <p className="mt-2 text-sm text-muted">{t(c.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
