"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [callbackUrl] = useState(() => {
    if (typeof window === "undefined") return "/";
    const url = new URL(window.location.href);
    return url.searchParams.get("callbackUrl") ?? "/";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-border bg-surface p-7 md:p-9">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">
          Account
        </p>
        <h1 className="mt-3 text-2xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          შედით თქვენს ანგარიშში, რომ ნახოთ შეკვეთები და მიიღოთ სწრაფი Checkout.
        </p>

        <form
          className="mt-7 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const prep = await fetch("/api/auth/login-prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
              });
              const data = (await prep.json().catch(() => null)) as {
                ok?: boolean;
                needsTwoFactor?: boolean;
                preLoginToken?: string;
                error?: string;
              } | null;
              if (!prep.ok || !data?.ok) {
                setError(data?.error ?? "Incorrect email or password.");
                return;
              }
              if (data.needsTwoFactor && data.preLoginToken) {
                sessionStorage.setItem(
                  "ck_2fa_login",
                  JSON.stringify({
                    email: email.trim().toLowerCase(),
                    preLoginToken: data.preLoginToken,
                    callbackUrl,
                  }),
                );
                router.push("/account/sign-in/two-factor");
                return;
              }
              const res = await signIn("credentials", {
                email: email.trim(),
                password,
                redirect: false,
                callbackUrl,
              });
              if (!res || res.error) {
                setError("Incorrect email or password.");
                return;
              }
              router.push(res.url ?? callbackUrl);
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="grid gap-2 text-sm">
            <span className="tracking-wide text-muted">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className="h-11 rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="tracking-wide text-muted">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="h-11 rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>

          <button
            disabled={loading}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm tracking-[0.14em] text-background disabled:opacity-60"
          >
            {loading ? "SIGNING IN…" : "SIGN IN"}
          </button>

          {error ? <p className="text-sm text-muted">{error}</p> : null}

          <p className="pt-2 text-sm text-muted">
            New here?{" "}
            <Link
              href="/account/sign-up"
              className="text-foreground underline decoration-[color:var(--accent-strong)] underline-offset-4"
            >
              Create an account
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

