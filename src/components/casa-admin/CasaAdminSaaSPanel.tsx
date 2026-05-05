"use client";

import { useCallback, useEffect, useState } from "react";

type KeyRow = {
  id: string;
  keyPrefix: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

type PartnerRow = {
  id: string;
  name: string;
  email: string;
  website: string | null;
  notes: string | null;
  credits: number;
  apiAccessEnabled: boolean;
  allowedEmbedOrigins: string | null;
  widgetSiteKey: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
  keys: KeyRow[];
  createdAt: string;
};

type ApiPayload = {
  partners: PartnerRow[];
  earningsCents: number;
  creditsSoldViaStripe: number;
};

export function CasaAdminSaaSPanel() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", email: "", website: "", notes: "" });
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [originDraft, setOriginDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError(null);
    const r = await fetch("/api/casa-admin/saas/partners");
    if (!r.ok) {
      setError("Could not load SaaS data.");
      return;
    }
    const payload = (await r.json()) as ApiPayload;
    setData(payload);
    const next: Record<string, string> = {};
    for (const p of payload.partners) {
      next[p.id] = p.allowedEmbedOrigins ?? "";
    }
    setOriginDraft(next);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const gel = (tetri: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "GEL" }).format(tetri / 100);

  return (
    <div className="space-y-10">
      {flashKey ? (
        <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--hermes)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_40%,#fff)] p-4 text-sm">
          <p className="font-semibold text-[color:var(--espresso)]">New API key (copy now)</p>
          <code className="mt-2 block break-all rounded bg-[color:var(--surface)] p-2 text-xs">{flashKey}</code>
          <button
            type="button"
            className="mt-2 text-xs uppercase tracking-wide text-muted underline"
            onClick={() => setFlashKey(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {data ? (
        <div className="grid gap-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_94%,var(--sand))] p-6 md:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Stripe revenue (ledger)</p>
            <p className="mt-1 text-2xl font-[family-name:var(--font-display)]">{gel(data.earningsCents)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Credits sold (Stripe)</p>
            <p className="mt-1 text-2xl font-[family-name:var(--font-display)]">
              {data.creditsSoldViaStripe.toLocaleString("en-US")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Partners</p>
            <p className="mt-1 text-2xl font-[family-name:var(--font-display)]">{data.partners.length}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Loading…</p>
      )}

      <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Add partner</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            const r = await fetch("/api/casa-admin/saas/partners", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: newPartner.name,
                email: newPartner.email,
                website: newPartner.website || undefined,
                notes: newPartner.notes || undefined,
              }),
            });
            setBusy(false);
            if (!r.ok) {
              setError("Could not create partner.");
              return;
            }
            setNewPartner({ name: "", email: "", website: "", notes: "" });
            await load();
          }}
        >
          <input
            required
            placeholder="Business name"
            value={newPartner.name}
            onChange={(e) => setNewPartner((p) => ({ ...p, name: e.target.value }))}
            className="h-11 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Billing email"
            value={newPartner.email}
            onChange={(e) => setNewPartner((p) => ({ ...p, email: e.target.value }))}
            className="h-11 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm"
          />
          <input
            placeholder="Website (optional)"
            value={newPartner.website}
            onChange={(e) => setNewPartner((p) => ({ ...p, website: e.target.value }))}
            className="h-11 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm md:col-span-2"
          />
          <input
            placeholder="Internal notes"
            value={newPartner.notes}
            onChange={(e) => setNewPartner((p) => ({ ...p, notes: e.target.value }))}
            className="h-11 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm md:col-span-2"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-full bg-[color:var(--espresso)] px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50 md:col-span-2"
          >
            Create partner
          </button>
        </form>
      </div>

      {data?.partners.map((p) => (
        <div
          key={p.id}
          className="space-y-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg">{p.name}</h3>
              <p className="text-sm text-muted">{p.email}</p>
              <p className="mt-2 text-sm">
                Credits: <strong>{p.credits.toLocaleString("en-US")}</strong>
              </p>
              <p className="mt-1 text-xs">
                API access:{" "}
                <strong className={p.apiAccessEnabled ? "text-green-800" : "text-red-800"}>
                  {p.apiAccessEnabled ? "active" : "blocked (unpaid / suspended)"}
                </strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const r = await fetch(`/api/casa-admin/saas/partners/${p.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ apiAccessEnabled: !p.apiAccessEnabled }),
                  });
                  setBusy(false);
                  if (!r.ok) setError("Could not toggle API access.");
                  else await load();
                }}
              >
                {p.apiAccessEnabled ? "Suspend API" : "Enable API"}
              </button>
              <button
                type="button"
                className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                disabled={busy}
                onClick={async () => {
                  const creditsStr = window.prompt("Stripe checkout — how many credits?", "1000");
                  if (!creditsStr) return;
                  const credits = Number.parseInt(creditsStr, 10);
                  if (!Number.isFinite(credits)) return;
                  setBusy(true);
                  const r = await fetch(`/api/casa-admin/saas/partners/${p.id}/checkout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credits }),
                  });
                  setBusy(false);
                  const j = await r.json().catch(() => ({}));
                  if (j.url) window.open(j.url as string, "_blank", "noopener,noreferrer");
                  else setError((j.error as string) || "Checkout failed");
                }}
              >
                Stripe top-up
              </button>
              <button
                type="button"
                className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                disabled={busy}
                onClick={async () => {
                  const creditsStr = window.prompt("Manual credits (e.g. after IBAN wire)?", "500");
                  if (!creditsStr) return;
                  const credits = Number.parseInt(creditsStr, 10);
                  if (!Number.isFinite(credits)) return;
                  const note = window.prompt("Note (optional)", "Bank transfer") ?? "";
                  setBusy(true);
                  const r = await fetch(`/api/casa-admin/saas/partners/${p.id}/credits`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credits, note }),
                  });
                  setBusy(false);
                  if (!r.ok) setError("Manual credit failed");
                  else await load();
                }}
              >
                Manual credits
              </button>
              <button
                type="button"
                className="rounded-full bg-[color:var(--espresso)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--sand-soft)]"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const r = await fetch(`/api/casa-admin/saas/partners/${p.id}/keys`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ label: "" }),
                  });
                  setBusy(false);
                  const j = (await r.json().catch(() => ({}))) as { apiKey?: string };
                  if (j.apiKey) setFlashKey(j.apiKey);
                  await load();
                }}
              >
                New API key
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">API keys</p>
            <ul className="mt-2 space-y-2 text-sm">
              {p.keys.length === 0 ? <li className="text-muted">None yet.</li> : null}
              {p.keys.map((k) => (
                <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[color:var(--surface)] px-3 py-2">
                  <span className="font-mono text-xs">
                    {k.keyPrefix} {k.revokedAt ? <span className="text-red-700">revoked</span> : "active"}
                  </span>
                  {!k.revokedAt ? (
                    <button
                      type="button"
                      className="text-[10px] uppercase tracking-wide text-muted underline"
                      onClick={async () => {
                        if (!window.confirm("Revoke this key?")) return;
                        setBusy(true);
                        await fetch(`/api/casa-admin/saas/keys/${k.id}/revoke`, { method: "POST" });
                        setBusy(false);
                        await load();
                      }}
                    >
                      Revoke
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_35%,#fff)] p-3 text-xs">
            <p className="font-semibold text-[color:var(--espresso)]">Stripe Billing</p>
            <p className="mt-1 text-muted">
              Tier: <strong className="text-[color:var(--espresso)]">{p.subscriptionTier}</strong> · Status:{" "}
              <strong className="text-[color:var(--espresso)]">{p.subscriptionStatus}</strong>
              {p.stripeSubscriptionId ? (
                <>
                  {" "}
                  · Sub <span className="font-mono text-[10px]">{p.stripeSubscriptionId.slice(0, 14)}…</span>
                </>
              ) : null}
            </p>
            {p.subscriptionPeriodEnd ? (
              <p className="mt-1 text-muted">
                Current period ends: {new Date(p.subscriptionPeriodEnd).toLocaleString(undefined, { dateStyle: "medium" })}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_40%,#fff)] p-3 text-xs">
            <p className="font-semibold text-[color:var(--espresso)]">Licensed widget snippet</p>
            <p className="text-muted">
              Domains must match <strong>allowed origins</strong> below. Script calls <code className="text-[10px]">/api/v1/widget/verify</code>{" "}
              before opening the modal.
            </p>
            {p.widgetSiteKey ? (
              <code className="mt-1 block break-all rounded bg-[color:var(--surface)] p-2 text-[10px] text-muted">
                {`<script src="${typeof window !== "undefined" ? window.location.origin : ""}/casa-skin-widget.js" data-site-key="${p.widgetSiteKey}" async></script>`}
              </code>
            ) : (
              <p className="text-amber-800">No public widget key yet — generate one to use the snippet.</p>
            )}
            <button
              type="button"
              className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const r = await fetch(`/api/casa-admin/saas/partners/${p.id}/widget-site-key`, { method: "POST" });
                setBusy(false);
                if (!r.ok) setError("Could not generate widget key.");
                else await load();
              }}
            >
              {p.widgetSiteKey ? "Rotate widget key" : "Generate widget key"}
            </button>
          </div>

          <div className="space-y-3 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_40%,#fff)] p-3 text-xs">
            <div>
              <p className="font-semibold text-[color:var(--espresso)]">Iframe (postMessage API key)</p>
              <code className="mt-1 block break-all text-[10px] text-muted">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /embed/skin-analysis?partnerId={p.id}
              </code>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Allowed parent origins (comma-separated)
              </label>
              <textarea
                className="mt-1 w-full rounded border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] p-2 text-xs"
                rows={2}
                placeholder="https://partner.com, https://app.partner.com"
                value={originDraft[p.id] ?? ""}
                onChange={(e) => setOriginDraft((m) => ({ ...m, [p.id]: e.target.value }))}
              />
              <button
                type="button"
                className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted underline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const raw = (originDraft[p.id] ?? "").trim();
                  const r = await fetch(`/api/casa-admin/saas/partners/${p.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ allowedEmbedOrigins: raw || null }),
                  });
                  setBusy(false);
                  if (!r.ok) setError("Could not save embed origins.");
                  else await load();
                }}
              >
                Save embed origins
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-[color:color-mix(in_srgb,var(--sand)_50%,#fff)] p-3 text-xs text-muted">
            <p className="font-semibold text-[color:var(--espresso)]">Public endpoint</p>
            <code className="mt-1 block break-all">
              POST {typeof window !== "undefined" ? window.location.origin : ""}/api/v1/skin/analyze
            </code>
            <p className="mt-2">Header: X-API-Key: &lt;key&gt; — Body: multipart field image, or JSON imageBase64 + mimeType.</p>
            <p className="mt-2">
              Short-lived iframe token: <code className="text-[10px]">POST …/api/v1/embed-token</code> then Bearer{" "}
              <code className="text-[10px]">ck_embed_…</code> on analyze.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
