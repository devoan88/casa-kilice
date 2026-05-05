"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
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
        <h1 className="mt-3 text-2xl tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          შექმენით ანგარიში მსოფლიოს ნებისმიერი წერტილიდან სწრაფი შეძენისთვის.
        </p>

        <form
          className="mt-7 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name, email, password }),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok || !json.ok) {
                setError(json?.error ?? "Could not create account.");
                return;
              }

              await signIn("credentials", {
                email,
                password,
                redirect: false,
              });
              router.push("/");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="grid gap-2 text-sm">
            <span className="tracking-wide text-muted">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              autoComplete="name"
              required
              className="h-11 rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
              required
              className="h-11 rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>

          <button
            disabled={loading}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm tracking-[0.14em] text-background disabled:opacity-60"
          >
            {loading ? "CREATING…" : "CREATE ACCOUNT"}
          </button>

          {error ? <p className="text-sm text-muted">{error}</p> : null}

          <p className="pt-2 text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/account/sign-in"
              className="text-foreground underline decoration-[color:var(--accent-strong)] underline-offset-4"
            >
              Sign in
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

