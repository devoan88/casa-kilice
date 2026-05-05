"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function CasaAdminOrdersToolbar() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const next = q.trim();
        startTransition(() => {
          const url = next ? `/casa-admin/orders?q=${encodeURIComponent(next)}` : "/casa-admin/orders";
          router.push(url);
        });
      }}
    >
      <div className="min-w-[min(100%,18rem)] flex-1">
        <label htmlFor="order-search" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Search orders
        </label>
        <input
          id="order-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Order #, name, or phone…"
          className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[color:var(--espresso)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--sand-soft)] disabled:opacity-60"
      >
        {pending ? "…" : "Search"}
      </button>
      {initial ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setQ("");
            startTransition(() => router.push("/casa-admin/orders"));
          }}
          className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted hover:text-[color:var(--espresso)]"
        >
          Clear
        </button>
      ) : null}
    </form>
  );
}
