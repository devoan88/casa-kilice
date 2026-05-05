"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const MSG_TYPE = "casa-kilice-skin-api-key";

export function SkinEmbedWidget() {
  const sp = useSearchParams();
  const partnerId = sp.get("partnerId")?.trim() || "";

  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) {
      setAllowedOrigins([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const r = await fetch(`/api/saas/embed-policy?partnerId=${encodeURIComponent(partnerId)}`);
      const j = (await r.json().catch(() => ({}))) as { origins?: string[] };
      if (!cancelled) setAllowedOrigins(Array.isArray(j.origins) ? j.origins : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [partnerId]);

  const originAllowed = useCallback(
    (origin: string) => {
      if (allowedOrigins.length === 0) return true;
      return allowedOrigins.includes(origin);
    },
    [allowedOrigins],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const d = event.data as { type?: string; apiKey?: string } | null;
      if (!d || d.type !== MSG_TYPE || typeof d.apiKey !== "string" || !d.apiKey.trim()) return;
      if (!originAllowed(event.origin)) {
        setErr(`Ignored key from unauthorized origin: ${event.origin}`);
        return;
      }
      setErr(null);
      setApiKey(d.apiKey.trim());
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [originAllowed]);

  const hint = useMemo(() => {
    if (!partnerId) {
      return "Development mode: add ?partnerId=… to enforce allowed origins from admin.";
    }
    if (allowedOrigins.length === 0) {
      return "No origin allowlist set — any parent page can deliver a key via postMessage (set comma-separated origins in admin).";
    }
    return `Accepting keys only from: ${allowedOrigins.join(", ")}`;
  }, [partnerId, allowedOrigins]);

  async function analyze() {
    if (!apiKey || !file) {
      setErr("Provide an image and ensure the host page has sent your API key via postMessage.");
      return;
    }
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("image", file);
      const r = await fetch("/api/v1/skin/analyze", {
        method: "POST",
        headers: { "X-API-Key": apiKey },
        body: fd,
      });
      const text = await r.text();
      let j: Record<string, unknown> = {};
      try {
        j = JSON.parse(text) as Record<string, unknown>;
      } catch {
        /* ignore */
      }
      if (!r.ok) {
        setErr((j.error as string) || `HTTP ${r.status}`);
        return;
      }
      setResult(JSON.stringify(j, null, 2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="box-border min-h-[320px] max-w-md rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-4 text-left text-sm shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Casa Kilicé · Skin API</p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
      {apiKey ? (
        <p className="mt-2 text-xs text-green-800">API key received — ready to analyze.</p>
      ) : (
        <p className="mt-2 text-xs text-amber-800">
          Waiting for <code className="text-[10px]">postMessage</code> from your site…
        </p>
      )}
      <pre className="mt-2 overflow-x-auto rounded bg-[color:var(--surface)] p-2 text-[10px] text-muted">
        {`parent.postMessage(
  { type: "${MSG_TYPE}", apiKey: "ck_saas_…" },
  "${typeof window !== "undefined" ? window.location.origin : "https://your-casa-domain"}"
);`}
      </pre>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="mt-3 block w-full text-xs"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => void analyze()}
        className="mt-4 w-full rounded-full bg-[color:var(--espresso)] py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
      >
        {busy ? "Analyzing…" : "Run analysis"}
      </button>
      {err ? <p className="mt-3 text-xs text-red-700">{err}</p> : null}
      {result ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded bg-[color:var(--surface)] p-2 text-[10px]">{result}</pre>
      ) : null}
    </div>
  );
}
