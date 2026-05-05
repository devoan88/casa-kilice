"use client";

import { useCallback, useEffect, useState } from "react";

type SetupPayload = { secret: string; qrDataUrl: string; otpauthUrl: string };

export function TwoFactorSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [enableCode, setEnableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/account/two-factor/status");
    if (!r.ok) {
      setEnabled(null);
      return;
    }
    const j = (await r.json()) as { enabled: boolean };
    setEnabled(j.enabled);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startSetup = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const r = await fetch("/api/account/two-factor/setup", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not start setup.");
        return;
      }
      setSetup(j as SetupPayload);
      setEnableCode("");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async () => {
    if (!setup) return;
    const code = enableCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your app.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch("/api/account/two-factor/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, secret: setup.secret }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not enable 2FA.");
        return;
      }
      setMessage("Two-factor authentication is now on.");
      setSetup(null);
      setEnableCode("");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const confirmDisable = async () => {
    const code = disableCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6 || disablePassword.length < 8) {
      setError("Password and 6-digit code are required.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch("/api/account/two-factor/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword, code }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not disable 2FA.");
        return;
      }
      setMessage("Two-factor authentication is off.");
      setDisablePassword("");
      setDisableCode("");
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (enabled === null) {
    return <p className="text-sm text-muted">Loading security settings…</p>;
  }

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h2 className="text-lg tracking-tight">Two-factor authentication</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Add a second step at sign-in with an authenticator app. We recommend Google Authenticator or Authy
        (prefer apps over SMS).
      </p>

      {message ? <p className="mt-4 text-sm text-foreground">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}

      {!enabled && !setup ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void startSetup()}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-6 text-xs tracking-[0.2em] text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_75%,var(--accent)_25%)] disabled:opacity-50"
        >
          {busy ? "PLEASE WAIT…" : "SET UP AUTHENTICATOR"}
        </button>
      ) : null}

      {!enabled && setup ? (
        <div className="mt-6 grid gap-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from server */}
            <img
              src={setup.qrDataUrl}
              alt="Authenticator QR"
              width={220}
              height={220}
              className="rounded-2xl border border-border bg-background p-2"
            />
            <div className="max-w-sm text-sm text-muted">
              <p className="font-medium text-foreground">Scan the code</p>
              <p className="mt-2 leading-relaxed">
                Open your authenticator app, add an account, and scan this QR. If you cannot scan, enter the
                key manually (shown once).
              </p>
              <p className="mt-3 break-all font-mono text-xs text-foreground">{setup.secret}</p>
            </div>
          </div>
          <label className="grid max-w-xs gap-2 text-sm">
            <span className="tracking-[0.2em] uppercase text-muted">Confirm code</span>
            <input
              value={enableCode}
              onChange={(e) => setEnableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="h-12 rounded-2xl border border-border bg-background px-4 text-center font-mono text-lg tracking-[0.3em] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmEnable()}
              className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-xs tracking-[0.2em] text-background disabled:opacity-50"
            >
              ENABLE 2FA
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setSetup(null);
                setEnableCode("");
                setError(null);
              }}
              className="text-xs tracking-wide text-muted underline decoration-[color:var(--accent-strong)] underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {enabled ? (
        <div className="mt-6 grid max-w-md gap-4">
          <p className="text-sm text-foreground">Authenticator is active on your account.</p>
          <label className="grid gap-2 text-sm">
            <span className="tracking-wide text-muted">Account password</span>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              autoComplete="current-password"
              className="h-11 rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="tracking-wide text-muted">Authenticator code</span>
            <input
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              className="h-11 rounded-2xl border border-border bg-background px-4 text-center font-mono tracking-[0.25em] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirmDisable()}
            className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-border px-6 text-xs tracking-[0.18em] text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] disabled:opacity-50"
          >
            TURN OFF 2FA
          </button>
        </div>
      ) : null}
    </div>
  );
}
