"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { formatMoney } from "@/lib/money";

export type CasaAdminProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  costCents: number;
  currency: string;
  imageUrl: string | null;
  isActive: boolean;
  stock: number;
  updatedAt: string;
};

function gelInputValueFromCents(cents: number) {
  return (cents / 100).toString();
}

function ProductEditorModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: CasaAdminProductRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [priceGel, setPriceGel] = useState(initial ? gelInputValueFromCents(initial.priceCents) : "");
  const [costGel, setCostGel] = useState(initial ? gelInputValueFromCents(initial.costCents ?? 0) : "0");
  const [stock, setStock] = useState(initial != null ? String(initial.stock) : "100");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 p-4 sm:items-center" role="dialog">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-[1] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 shadow-xl">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          {mode === "create" ? "Add product" : "Edit product"}
        </h2>
        {mode === "edit" && initial ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">/{initial.slug}</p>
        ) : null}
        <form
          className="mt-5 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setBusy(true);
            try {
              const gel = Number(priceGel);
              if (!Number.isFinite(gel) || gel <= 0) {
                setErr("Enter a valid price in GEL.");
                return;
              }
              const cost = Number(costGel);
              if (!Number.isFinite(cost) || cost < 0) {
                setErr("Enter a valid cost in GEL (0 or more).");
                return;
              }
              const stockN = Number.parseInt(stock.trim(), 10);
              if (!Number.isFinite(stockN) || stockN < 0) {
                setErr("Enter a valid stock count (0 or more).");
                return;
              }
              if (mode === "create") {
                const res = await fetch("/api/casa-admin/products", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    priceGel: gel,
                    costGel: cost,
                    imageUrl: imageUrl.trim() || undefined,
                    stock: stockN,
                  }),
                });
                if (!res.ok) {
                  setErr("Could not create product.");
                  return;
                }
              } else if (initial) {
                const res = await fetch(`/api/casa-admin/products/${initial.id}`, {
                  method: "PATCH",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    priceGel: gel,
                    costGel: cost,
                    imageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
                    stock: stockN,
                  }),
                });
                if (!res.ok) {
                  setErr("Could not update product.");
                  return;
                }
              }
              onSaved();
              onClose();
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-name">
              Name
            </label>
            <input
              id="p-name"
              required
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-price">
                Price (GEL)
              </label>
              <input
                id="p-price"
                required
                inputMode="decimal"
                value={priceGel}
                onChange={(ev) => setPriceGel(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-cost">
                Cost (GEL)
              </label>
              <input
                id="p-cost"
                required
                inputMode="decimal"
                value={costGel}
                onChange={(ev) => setCostGel(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
              <p className="mt-1 text-[9px] text-muted">Unit cost for profit analytics.</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-cat">
                Category
              </label>
              <input
                id="p-cat"
                required
                value={category}
                onChange={(ev) => setCategory(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-stock">
                Stock (units)
              </label>
              <input
                id="p-stock"
                required
                inputMode="numeric"
                value={stock}
                onChange={(ev) => setStock(ev.target.value)}
                className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-desc">
              Description
            </label>
            <textarea
              id="p-desc"
              required
              rows={4}
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="p-img">
              Image URL
            </label>
            <input
              id="p-img"
              value={imageUrl}
              onChange={(ev) => setImageUrl(ev.target.value)}
              placeholder="https://… or /assets/…"
              className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </div>
          {err ? <p className="text-sm text-red-800">{err}</p> : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[color:var(--espresso)] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
            >
              {busy ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CasaAdminProductsPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<CasaAdminProductRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "create" | { mode: "edit"; product: CasaAdminProductRow }>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/casa-admin/products");
    if (!res.ok) {
      setLoadError("Could not load products.");
      return;
    }
    const data = (await res.json()) as { ok: boolean; products?: CasaAdminProductRow[] };
    if (data.ok && data.products) {
      setProducts(
        data.products.map((p) => ({
          ...p,
          stock: typeof p.stock === "number" ? p.stock : 0,
          updatedAt: p.updatedAt,
        })),
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Products</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Prices and images apply to the live shop as soon as you save. Removing a product hides it from the shop.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="rounded-full bg-[color:var(--espresso)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)]"
        >
          Add new product
        </button>
      </div>

      {loadError ? <p className="text-sm text-red-800">{loadError}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={[
                  "border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] align-top last:border-0",
                  p.isActive ? "" : "opacity-60",
                  p.stock < 5 ? "bg-amber-50/50" : "",
                ].join(" ")}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-[color:var(--espresso)]">{p.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{p.category}</td>
                <td className="px-4 py-3 text-right tabular-nums text-xs font-medium">
                  {formatMoney(p.priceCents, p.currency)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-muted">
                  {formatMoney(typeof p.costCents === "number" ? p.costCents : 0, p.currency)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs">
                  <span className={p.stock < 5 ? "font-semibold text-amber-900" : "text-[color:var(--espresso)]"}>
                    {p.stock}
                  </span>
                  {p.stock < 5 ? (
                    <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-amber-800">
                      Low stock
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs">{p.isActive ? "Live" : "Hidden"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", product: p })}
                      className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--espresso)]"
                    >
                      Edit
                    </button>
                    {!p.isActive ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch(`/api/casa-admin/products/${p.id}`, {
                            method: "PATCH",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ isActive: true }),
                          });
                          if (res.ok) {
                            await load();
                            router.refresh();
                          }
                        }}
                        className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--espresso)]"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Hide “${p.name}” from the shop?`)) return;
                          const res = await fetch(`/api/casa-admin/products/${p.id}`, { method: "DELETE" });
                          if (res.ok) {
                            await load();
                            router.refresh();
                          }
                        }}
                        className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "create" ? (
        <ProductEditorModal
          mode="create"
          onClose={() => setModal(null)}
          onSaved={async () => {
            await load();
            router.refresh();
          }}
        />
      ) : null}
      {modal && modal !== "create" ? (
        <ProductEditorModal
          mode="edit"
          initial={modal.product}
          onClose={() => setModal(null)}
          onSaved={async () => {
            await load();
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
