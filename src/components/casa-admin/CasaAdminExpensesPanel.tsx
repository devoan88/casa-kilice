"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { formatMoney } from "@/lib/money";

type Expense = {
  id: string;
  label: string;
  category: string;
  amountCents: number;
  currency: string;
  incurredAt: string;
  notes: string | null;
};

export function CasaAdminExpensesPanel() {
  const router = useRouter();
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("Ads");
  const [amountGel, setAmountGel] = useState("");
  const [incurredAt, setIncurredAt] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/casa-admin/expenses");
    const j = (await res.json().catch(() => null)) as { ok?: boolean; expenses?: Expense[]; error?: string } | null;
    if (!res.ok || !j?.ok || !Array.isArray(j.expenses)) {
      setErr(j?.error ?? "Could not load expenses.");
      setRows([]);
      return;
    }
    setRows(j.expenses);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy("add");
    try {
      const res = await fetch("/api/casa-admin/expenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          category: category.trim(),
          amountGel: Number.parseFloat(amountGel.replace(",", ".")),
          incurredAt: incurredAt.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? "Could not add expense.");
        return;
      }
      setLabel("");
      setAmountGel("");
      setNotes("");
      await load();
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this expense?")) return;
    setBusy(id);
    setErr(null);
    try {
      const res = await fetch(`/api/casa-admin/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setErr("Delete failed.");
        return;
      }
      await load();
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 md:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">Expenses</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">Record one-off costs (ads, packaging, software). Amounts are stored in GEL (tetri internally).</p>

      {err ? <p className="mt-4 text-sm text-red-800">{err}</p> : null}

      <form onSubmit={add} className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <label className="grid gap-1 text-xs font-medium text-muted md:col-span-2">
          Label
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            maxLength={200}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Category
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            maxLength={80}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Amount (GEL)
          <input
            required
            inputMode="decimal"
            value={amountGel}
            onChange={(e) => setAmountGel(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Date (optional)
          <input
            type="datetime-local"
            value={incurredAt}
            onChange={(e) => setIncurredAt(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-end md:col-span-2 lg:col-span-1">
          <button
            type="submit"
            disabled={busy === "add"}
            className="w-full rounded-full bg-[color:var(--espresso)] py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
          >
            Add expense
          </button>
        </div>
        <label className="grid gap-1 text-xs font-medium text-muted md:col-span-2 lg:col-span-6">
          Notes (optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            maxLength={2000}
          />
        </label>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No expenses recorded.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {new Date(r.incurredAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--espresso)]">{r.label}</td>
                  <td className="px-4 py-3 text-xs text-muted">{r.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs font-medium">{formatMoney(r.amountCents, r.currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busy === r.id}
                      onClick={() => void remove(r.id)}
                      className="text-[10px] font-semibold uppercase tracking-wide text-red-800 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
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
