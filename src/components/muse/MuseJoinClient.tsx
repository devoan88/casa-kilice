"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CONSENT_TEXT =
  "ვეთანხმები წესებს და პირობებს და ვადასტურებ, რომ ჩემ მიერ ატვირთული მასალის გამოყენების უფლებას ვაძლევ Casa Kilicé-ს მარკეტინგული მიზნებისთვის.";

const FOLLOWER_OPTIONS = [
  { value: "<5k", label: "Under 5k" },
  { value: "5k-20k", label: "5k — 20k" },
  { value: "20k-50k", label: "20k — 50k" },
  { value: "50k+", label: "50k +" },
] as const;

export function MuseJoinClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [followerCountRange, setFollowerCountRange] = useState<(typeof FOLLOWER_OPTIONS)[number]["value"]>("<5k");
  const [birthDate, setBirthDate] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldClass =
    "h-12 w-full rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] px-3.5 text-[15px] text-[color:var(--espresso)] outline-none transition-[box-shadow,border-color] placeholder:text-muted/70 focus:border-[color:color-mix(in_srgb,var(--hermes)_55%,var(--espresso))] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--hermes)_28%,transparent)]";

  return (
    <div className="min-h-[72vh] bg-[color:var(--sand)] pb-24 pt-10 md:pt-16">
      <div className="mx-auto w-full max-w-lg px-5">
        <Link
          href="/creator-portal"
          className="inline-flex text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,var(--espresso)_68%,#555)] underline-offset-4 transition-colors hover:text-[color:var(--hermes)] hover:underline"
        >
          ← Muse portal
        </Link>

        <div className="relative mt-10 overflow-hidden rounded-[1.35rem] border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_96%,#fff)] shadow-[0_24px_64px_rgba(60,53,48,0.1)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--hermes)_45%,transparent)] to-transparent"
            aria-hidden
          />
          <div className="p-8 md:p-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-muted">Casa Kilicé</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-[1.65rem] font-semibold leading-tight tracking-tight text-[color:var(--espresso)] md:text-[1.85rem]">
              Muse join
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A secure, invitation-grade onboarding. Passwords are hashed with bcrypt; content you upload later stays
              pending until the house approves it.
            </p>

            <form
              className="mt-9 grid gap-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                if (!consent) {
                  setError("Please confirm the marketing usage consent to continue.");
                  return;
                }
                setLoading(true);
                try {
                  const res = await fetch("/api/muse/register", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      name,
                      email,
                      password,
                      instagramHandle,
                      tiktokHandle,
                      followerCountRange,
                      birthDate,
                      marketingConsent: true as const,
                    }),
                  });
                  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                  if (!res.ok || !json.ok) {
                    setError(json?.error ?? "Could not complete registration.");
                    return;
                  }

                  const sign = await signIn("credentials", {
                    email: email.trim().toLowerCase(),
                    password,
                    redirect: false,
                  });
                  if (sign?.error) {
                    router.push("/account/sign-in?callbackUrl=/muse-dashboard");
                    return;
                  }
                  router.push("/muse-dashboard");
                  router.refresh();
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  required
                  className={fieldClass}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldClass}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className={fieldClass}
                />
              </label>

              <div className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Date of birth</span>
                <div className="relative">
                  <Calendar
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-[color:color-mix(in_srgb,var(--espresso)_42%,transparent)]"
                    aria-hidden
                  />
                  <input
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    type="date"
                    required
                    className={`${fieldClass} pl-11 [color-scheme:light]`}
                  />
                </div>
                <span className="text-xs text-muted">You must be 16 or older.</span>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Instagram</span>
                <input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  type="text"
                  autoComplete="off"
                  placeholder="@handle"
                  required
                  className={fieldClass}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">TikTok</span>
                <input
                  value={tiktokHandle}
                  onChange={(e) => setTiktokHandle(e.target.value)}
                  type="text"
                  autoComplete="off"
                  placeholder="@handle"
                  required
                  className={fieldClass}
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Combined follower range
                </span>
                <select
                  value={followerCountRange}
                  onChange={(e) =>
                    setFollowerCountRange(e.target.value as (typeof FOLLOWER_OPTIONS)[number]["value"])
                  }
                  required
                  className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23655' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  {FOLLOWER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex cursor-pointer gap-3.5 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--sand-soft)_35%,transparent)] p-4 text-[13px] leading-snug text-[color:color-mix(in_srgb,var(--espresso)_90%,#2a2622)]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[color:color-mix(in_srgb,var(--espresso)_30%,transparent)] accent-[color:var(--hermes)]"
                />
                <span>{CONSENT_TEXT}</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-[3.25rem] w-full items-center justify-center rounded-full bg-[color:var(--espresso)] text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--surface)] shadow-[0_12px_32px_rgba(60,53,48,0.18)] transition-opacity hover:opacity-[0.96] disabled:opacity-50"
              >
                {loading ? "Securing your account…" : "Enter the Muse space"}
              </button>

              {error ? <p className="text-sm text-red-800/90">{error}</p> : null}

              <p className="text-center text-sm text-muted">
                Already registered?{" "}
                <Link
                  href="/account/sign-in?callbackUrl=/muse-dashboard"
                  className="font-medium text-[color:var(--espresso)] underline decoration-[color:color-mix(in_srgb,var(--hermes)_40%,transparent)] underline-offset-4 hover:text-[color:var(--hermes)]"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
