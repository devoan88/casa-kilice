"use client";

import { useState } from "react";

type Props = { initialTaxBps: number };

export function CasaAdminFinanceTaxCard({ initialTaxBps }: Props) {
  const [bps, setBps] = useState(initialTaxBps);
  const [input, setInput] = useState(initialTaxBps === 0 ? "" : (initialTaxBps / 100).toString());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    const n = Number.parseFloat(input.replace(",", "."));
    if (input.trim() !== "" && (!Number.isFinite(n) || n < 0 || n > 100)) {
      setMsg("Enter a tax percent between 0 and 100.");
      return;
    }
    const pct = input.trim() === "" ? 0 : n;
    setSaving(true);
    try {
      const res = await fetch("/api/casa-admin/site-content", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ financeTaxPercent: pct }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; content?: { financeTaxBps?: number }; error?: string } | null;
      if (!res.ok || !j?.ok || j.content?.financeTaxBps == null) {
        setMsg(j?.error ?? "Could not save.");
        return;
      }
      setBps(j.content.financeTaxBps);
      setMsg("Saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 md:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">Tax estimator</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Set an estimated turnover tax rate (e.g. 1%). The dashboard uses it on this month&apos;s recognised GEL revenue only — not legal advice.
      </p>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs font-medium text-muted">
          Tax rate (%)
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="h-11 w-36 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-full bg-[color:var(--espresso)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save rate"}
        </button>
        <p className="text-[11px] text-muted">
          Stored: <span className="font-mono text-[color:var(--espresso)]">{(bps / 100).toFixed(2)}%</span>
        </p>
      </div>
      {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
    </section>
  );
}
