"use client";

import { useState } from "react";

export function CasaAdminMarketingForm() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(
    "<p style=\"margin:0;font-size:16px;line-height:1.6;color:#3c3530\">Hello — a quiet update from Casa Kilicé.</p>",
  );
  const [recipients, setRecipients] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setResult(null);
        const list = recipients
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (list.length === 0) {
          setResult("Add at least one email (one per line).");
          return;
        }
        setBusy(true);
        try {
          const res = await fetch("/api/casa-admin/marketing/send", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ subject: subject.trim(), html, recipients: list }),
          });
          const json = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            sent?: number;
            total?: number;
            error?: string;
          };
          if (!res.ok || !json.ok) {
            setResult(json.error ?? "Send failed.");
            return;
          }
          setResult(`Sent ${json.sent ?? 0} / ${json.total ?? list.length}.`);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="grid gap-1 text-xs">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Subject</span>
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">HTML body</span>
        <textarea
          required
          rows={10}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="font-mono text-xs rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Recipients (one email per line, max 50)</span>
        <textarea
          required
          rows={5}
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="client@example.com"
          className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
        />
      </label>
      {result ? <p className="text-sm text-muted">{result}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-[color:var(--espresso)] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)] disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send campaign"}
      </button>
    </form>
  );
}
