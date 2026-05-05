"use client";

import { useCallback, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  percentOff: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
};

export function CasaAdminPromoCouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");
  const [expiresAt, setExpiresAt] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/casa-admin/promo-coupons");
    const j = (await res.json().catch(() => null)) as { ok?: boolean; coupons?: Coupon[]; error?: string } | null;
    if (!res.ok || !j?.ok || !Array.isArray(j.coupons)) {
      setError(j?.error ?? "Could not load promo codes.");
      setCoupons([]);
      return;
    }
    setCoupons(j.coupons);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/casa-admin/promo-coupons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: code.trim(),
        percentOff: Number.parseInt(percentOff, 10),
        expiresAt: expiresAt.trim(),
      }),
    });
    const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !j?.ok) {
      setError(j?.error ?? "Could not create code.");
      return;
    }
    setCode("");
    setPercentOff("10");
    await load();
  }

  async function toggleActive(c: Coupon, isActive: boolean) {
    setBusyId(c.id);
    setError(null);
    try {
      const res = await fetch(`/api/casa-admin/promo-coupons/${c.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setError(j?.error ?? "Update failed.");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 md:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">Promo codes</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Create percentage discounts with an expiry. Codes are stored uppercase (e.g. <span className="font-mono">SALE10</span>).
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
      ) : null}

      <form onSubmit={handleCreate} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-xs font-medium text-muted sm:col-span-2 lg:col-span-1">
          Code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SALE10"
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 font-mono text-sm uppercase text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
            maxLength={40}
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          % off
          <input
            type="number"
            min={1}
            max={100}
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted sm:col-span-2 lg:col-span-2">
          Expires (local)
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
            required
          />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-full bg-[color:var(--espresso)] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)] hover:opacity-[0.96]"
          >
            Add promo code
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  Loading…
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No promo codes yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[color:var(--espresso)]">{c.code}</td>
                  <td className="px-4 py-3 text-xs">{c.percentOff}%</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(c.expiresAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-xs">{c.isActive ? "Active" : "Off"}</td>
                  <td className="px-4 py-3 text-right">
                    {c.isActive ? (
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={() => void toggleActive(c, false)}
                        className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--espresso)] hover:bg-[color:color-mix(in_srgb,var(--sand)_60%,transparent)] disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={() => void toggleActive(c, true)}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-950 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
