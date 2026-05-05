"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function CasaAdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
          const res = await signIn("credentials", {
            email: email.trim(),
            password,
            redirect: false,
          });
          if (res?.error) {
            setError("Invalid email or password.");
            return;
          }
          window.location.assign("/casa-admin");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <label htmlFor="casa-admin-email" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Email
        </label>
        <input
          id="casa-admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]"
        />
      </div>
      <div>
        <label htmlFor="casa-admin-password" className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Password
        </label>
        <input
          id="casa-admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="mt-1.5 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]"
        />
      </div>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-[color:var(--espresso)] py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--sand-soft)] disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-[10px] text-muted">
        Use the exact email in <code className="text-[color:var(--espresso)]">ADMIN_EMAIL</code> with{" "}
        <code className="text-[color:var(--espresso)]">ADMIN_PASSWORD_HASH</code> (bcrypt) or legacy{" "}
        <code className="text-[color:var(--espresso)]">ADMIN_PASSWORD</code> in <code className="text-[color:var(--espresso)]">.env</code> — or any account whose DB{" "}
        <code className="text-[color:var(--espresso)]">role</code> is <code className="text-[color:var(--espresso)]">ADMIN</code>. If you use 2FA,{" "}
        <Link href="/account/sign-in?callbackUrl=/casa-admin" className="underline underline-offset-2">
          sign in here
        </Link>
        .
      </p>
    </form>
  );
}
