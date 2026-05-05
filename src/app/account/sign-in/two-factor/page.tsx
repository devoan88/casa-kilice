"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ck_2fa_login";

type Pending = { email: string; preLoginToken: string; callbackUrl: string };

export default function TwoFactorSignInPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Pending | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/account/sign-in");
      return;
    }
    try {
      const p = JSON.parse(raw) as Pending;
      if (!p?.email || !p?.preLoginToken || !p?.callbackUrl) throw new Error("bad");
      setPending(p);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      router.replace("/account/sign-in");
    }
  }, [router]);

  if (!pending) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-border bg-surface p-7 md:p-9">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">Secure sign-in</p>
        <h1 className="mt-3 text-2xl tracking-tight">Authenticator</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Enter the 6-digit code from your app (Google Authenticator, Authy, or similar).
        </p>

        <form
          className="mt-8 grid gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const digits = code.replace(/\D/g, "").slice(0, 6);
            if (digits.length !== 6) {
              setError("Code must be 6 digits.");
              setLoading(false);
              return;
            }
            const res = await signIn("credentials", {
              email: pending.email,
              totpCode: digits,
              preLoginToken: pending.preLoginToken,
              redirect: false,
              callbackUrl: pending.callbackUrl,
            });
            setLoading(false);
            if (!res || res.error) {
              setError("Invalid code. Try again.");
              return;
            }
            sessionStorage.removeItem(STORAGE_KEY);
            router.push(res.url ?? pending.callbackUrl);
          }}
        >
          <label className="grid gap-2 text-sm">
            <span className="tracking-[0.2em] uppercase text-muted">Code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={6}
              placeholder="000000"
              className="h-14 rounded-2xl border border-border bg-background px-4 text-center font-mono text-2xl tracking-[0.35em] text-foreground outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm tracking-[0.18em] text-background disabled:opacity-60"
          >
            {loading ? "VERIFYING…" : "CONTINUE"}
          </button>

          {error ? <p className="text-center text-sm text-muted">{error}</p> : null}

          <p className="text-center text-xs text-muted">
            <button
              type="button"
              className="underline decoration-[color:var(--accent-strong)] underline-offset-4"
              onClick={() => {
                sessionStorage.removeItem(STORAGE_KEY);
                router.push("/account/sign-in");
              }}
            >
              Back to sign in
            </button>
            {" · "}
            <Link href="/" className="underline decoration-[color:var(--accent-strong)] underline-offset-4">
              Home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
