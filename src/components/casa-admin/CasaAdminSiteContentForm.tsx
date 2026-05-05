"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type SiteContentFormValues = {
  homeHeroMainText: string | null;
  homeHeroSubText: string | null;
  homeHeroImageUrl: string | null;
  gelPerUsdMinor: number;
  gelPerEurMinor: number;
  deliveryTbilisiCents: number;
  deliveryRegionCents: number;
  deliveryIntlCents: number;
};

function minorUsdToInput(m: number) {
  return (m / 100).toString();
}

function centsToGelInput(c: number) {
  return (c / 100).toString();
}

export function CasaAdminSiteContentForm({ initial }: { initial: SiteContentFormValues }) {
  const router = useRouter();
  const [mainText, setMainText] = useState(initial.homeHeroMainText ?? "");
  const [subText, setSubText] = useState(initial.homeHeroSubText ?? "");
  const [imageUrl, setImageUrl] = useState(initial.homeHeroImageUrl ?? "");
  const [gelPerUsd, setGelPerUsd] = useState(minorUsdToInput(initial.gelPerUsdMinor));
  const [gelPerEur, setGelPerEur] = useState(minorUsdToInput(initial.gelPerEurMinor));
  const [deliveryTbilisiGel, setDeliveryTbilisiGel] = useState(centsToGelInput(initial.deliveryTbilisiCents));
  const [deliveryRegionGel, setDeliveryRegionGel] = useState(centsToGelInput(initial.deliveryRegionCents));
  const [deliveryIntlGel, setDeliveryIntlGel] = useState(centsToGelInput(initial.deliveryIntlCents));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        setBusy(true);
        try {
          const u = Number(gelPerUsd);
          const eur = Number(gelPerEur);
          const tb = Number(deliveryTbilisiGel);
          const rg = Number(deliveryRegionGel);
          const ig = Number(deliveryIntlGel);
          if (![u, eur, tb, rg, ig].every((n) => Number.isFinite(n))) {
            setMsg("Enter valid numbers for FX and delivery.");
            return;
          }
          const res = await fetch("/api/casa-admin/site-content", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              homeHeroMainText: mainText.trim() === "" ? null : mainText.trim(),
              homeHeroSubText: subText.trim() === "" ? null : subText.trim(),
              homeHeroImageUrl: imageUrl.trim() === "" ? null : imageUrl.trim(),
              gelPerUsd: u,
              gelPerEur: eur,
              deliveryTbilisiGel: tb,
              deliveryRegionGel: rg,
              deliveryIntlGel: ig,
            }),
          });
          if (!res.ok) {
            setMsg("Could not save. Check fields and try again.");
            return;
          }
          setMsg("Saved. Shop, checkout, and FX labels will use these values.");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted" htmlFor="hero-main">
          Hero main text
        </label>
        <textarea
          id="hero-main"
          rows={4}
          value={mainText}
          onChange={(ev) => setMainText(ev.target.value)}
          placeholder="Leave empty to use the default translation on the homepage."
          className="w-full rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted" htmlFor="hero-sub">
          Hero secondary text
        </label>
        <textarea
          id="hero-sub"
          rows={3}
          value={subText}
          onChange={(ev) => setSubText(ev.target.value)}
          placeholder="Leave empty for default."
          className="w-full rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted" htmlFor="hero-img">
          Hero image URL
        </label>
        <input
          id="hero-img"
          type="text"
          value={imageUrl}
          onChange={(ev) => setImageUrl(ev.target.value)}
          placeholder="https://… or /assets/… — replaces the scroll-hero product visual when set."
          className="w-full rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]"
        />
      </div>

      <div className="border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Display FX (reference only)</p>
        <p className="mt-1 text-xs text-muted">
          Used for “65 ₾ / $24 / €22” style labels. 1 USD = this many GEL; 1 EUR = this many GEL.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">GEL per 1 USD</span>
            <input
              type="number"
              step="0.01"
              min={1}
              max={25}
              value={gelPerUsd}
              onChange={(ev) => setGelPerUsd(ev.target.value)}
              className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">GEL per 1 EUR</span>
            <input
              type="number"
              step="0.01"
              min={1}
              max={25}
              value={gelPerEur}
              onChange={(ev) => setGelPerEur(ev.target.value)}
              className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Flat delivery fees (GEL)</p>
        <p className="mt-1 text-xs text-muted">Checkout and cart use these amounts by zone. Product base prices are edited under Products.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Tbilisi</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={deliveryTbilisiGel}
              onChange={(ev) => setDeliveryTbilisiGel(ev.target.value)}
              className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Other regions (GE)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={deliveryRegionGel}
              onChange={(ev) => setDeliveryRegionGel(ev.target.value)}
              className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">International</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={deliveryIntlGel}
              onChange={(ev) => setDeliveryIntlGel(ev.target.value)}
              className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      {msg ? <p className="text-sm text-muted">{msg}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-[color:var(--espresso)] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)] disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save content & commerce"}
      </button>
    </form>
  );
}
