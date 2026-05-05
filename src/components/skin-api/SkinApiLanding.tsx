"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MedicalDisclaimerStrip } from "@/components/legal/MedicalDisclaimerStrip";

function gelFromTetri(tetri: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "GEL" }).format(tetri / 100);
}

export function SkinApiLanding(props: {
  priceTetri: number;
  basicMonthlyScans: number;
  bankIban: string;
  bankName: string;
}) {
  const [step, setStep] = useState<"hero" | "register" | "pay">("hero");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [credits, setCredits] = useState(500);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const exampleMonthly = useMemo(() => {
    const analyses = 5000;
    const pack = Math.ceil(analyses / 500) * 500;
    return { analyses, pack, gel: gelFromTetri(props.priceTetri * pack) };
  }, [props.priceTetri]);

  async function register() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/saas/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, email, website: website || undefined }),
    });
    setBusy(false);
    const j = (await r.json().catch(() => ({}))) as { partnerId?: string; error?: string };
    if (!r.ok) {
      setErr(j.error || "Registration failed.");
      return;
    }
    if (j.partnerId) {
      setPartnerId(j.partnerId);
      setStep("pay");
    }
  }

  async function checkout() {
    if (!partnerId) return;
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/saas/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, email, credits }),
    });
    setBusy(false);
    const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
    if (j.url) {
      window.location.href = j.url;
      return;
    }
    setErr(j.error || "Checkout could not start.");
  }

  async function subscriptionCheckout(tier: "basic" | "premium") {
    if (!partnerId) return;
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/saas/subscription-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, email, tier }),
    });
    setBusy(false);
    const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
    if (j.url) {
      window.location.href = j.url;
      return;
    }
    setErr(j.error || "Subscription checkout could not start.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Beauty Tech · B2B</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[color:var(--espresso)] md:text-5xl">
        Skin Analysis API
      </h1>
      <p className="mt-4 text-lg text-muted">
        Casa Kilicé vision pipeline for undertone, depth, texture-aware signals, wellness-style modules, and curated
        product intelligence — consumable via REST API or embeddable widget for your own storefront or app.
      </p>
      <p className="mt-4 text-sm text-muted">
        <Link
          href="/business"
          className="font-medium text-foreground underline decoration-[color:var(--hermes)] underline-offset-4 hover:text-[color:var(--hermes)]"
        >
          For partners — subscription tiers &amp; Enterprise API
        </Link>
      </p>

      <div className="mt-10 grid gap-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] p-6 md:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Metered price</p>
          <p className="mt-2 text-3xl font-[family-name:var(--font-display)]">{gelFromTetri(props.priceTetri)}</p>
          <p className="text-sm text-muted">per analysis credit (packs from 50 credits via Stripe).</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Example</p>
          <p className="mt-2 text-sm text-muted">
            ~{exampleMonthly.analyses.toLocaleString("en-US")} analyses / month → {exampleMonthly.pack} credits →{" "}
            <strong>{exampleMonthly.gel}</strong> in prepaid packs (before any volume agreements).
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-[color:color-mix(in_srgb,var(--hermes)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_35%,#fff)] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--espresso)]">Bank settlement (IBAN)</h2>
        <p className="mt-2 text-sm text-muted">
          Card payments run through Stripe (funds settle per your Stripe payout settings). For direct transfers, use the
          same IBAN shown on Casa Kilicé invoices; we then enable API access and grant credits manually after reconciliation.
        </p>
        {props.bankIban ? (
          <dl className="mt-4 space-y-1 text-sm">
            {props.bankName ? (
              <div>
                <dt className="text-muted">Bank</dt>
                <dd className="font-medium">{props.bankName}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted">IBAN</dt>
              <dd className="font-mono text-xs break-all">{props.bankIban}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted">IBAN is configured at deploy time for the live site.</p>
        )}
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Integration</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted">
          <li>
            <strong className="text-[color:var(--espresso)]">REST:</strong> <code className="text-xs">POST /api/v1/skin/analyze</code>{" "}
            with <code className="text-xs">X-API-Key</code> (issued after payment).
          </li>
          <li>
            <strong className="text-[color:var(--espresso)]">Iframe:</strong> embed{" "}
            <code className="break-all text-xs">/embed/skin-analysis?partnerId=&lt;your id&gt;</code> and pass the key via{" "}
            <code className="text-xs">postMessage</code> from your verified origin (see admin embed settings).
          </li>
          <li>
            <strong className="text-[color:var(--espresso)]">Snippet:</strong> add{" "}
            <code className="text-xs">/casa-skin-widget.js</code> with <code className="text-xs">data-site-key</code> — the
            script checks your domain against Casa Kilicé before opening the scan modal.
          </li>
        </ul>
      </div>

      {err ? <p className="mt-6 text-sm text-red-700">{err}</p> : null}

      {step === "hero" ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-[color:var(--espresso)] px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)]"
            onClick={() => setStep("register")}
          >
            Start subscription
          </button>
          <Link
            href="/"
            className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
          >
            Back to maison
          </Link>
        </div>
      ) : null}

      {step === "register" ? (
        <form
          className="mt-10 space-y-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_97%,var(--sand))] p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void register();
          }}
        >
          <h3 className="font-[family-name:var(--font-display)] text-lg">Register your business</h3>
          <input
            required
            className="h-11 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            required
            type="email"
            className="h-11 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm"
            placeholder="Billing email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="h-11 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm"
            placeholder="Website (optional)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[color:var(--espresso)] px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
            >
              Continue
            </button>
            <button type="button" className="text-sm text-muted underline" onClick={() => setStep("hero")}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {step === "pay" && partnerId ? (
        <div className="mt-10 space-y-8">
          <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_97%,var(--sand))] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg">Stripe Billing — monthly</h3>
            <p className="mt-2 text-sm text-muted">
              Automatic renewals via Stripe (payouts to your connected bank / IBAN per your Stripe settings). API keys
              reactivate when invoices succeed; access pauses on failed renewal.
            </p>
            <p className="mt-3 text-sm text-muted">
              <Link href="/business" className="font-medium text-foreground underline decoration-[color:var(--hermes)] underline-offset-4">
                Business page
              </Link>{" "}
              lists partner tiers at <strong>$49</strong>, <strong>$149</strong>, and <strong>$499</strong> — align your
              Stripe Product price IDs to those amounts; checkout below uses <strong>Basic</strong> (Starter / Professional
              entry) and <strong>Premium</strong> (Enterprise / unlimited scans).
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Basic</p>
                <p className="mt-2 text-sm text-muted">
                  <strong className="text-[color:var(--espresso)]">{props.basicMonthlyScans}</strong> scans included per
                  billing month (then prepaid credits apply if you top up).
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void subscriptionCheckout("basic")}
                  className="mt-4 w-full rounded-full bg-[color:var(--espresso)] py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
                >
                  Subscribe — Basic
                </button>
              </div>
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--hermes)_35%,transparent)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Premium</p>
                <p className="mt-2 text-sm text-muted">
                  <strong className="text-[color:var(--espresso)]">Unlimited</strong> scans for the API (fair-use rate
                  limits still apply to protect infrastructure).
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void subscriptionCheckout("premium")}
                  className="mt-4 w-full rounded-full border border-[color:var(--espresso)] py-2 text-[10px] font-semibold uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  Subscribe — Premium
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_97%,var(--sand))] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg">Or — prepaid credits (one-time)</h3>
            <p className="text-sm text-muted">
              API access stays off until checkout succeeds. After payment, request API keys from Casa Kilicé admin
              (same email as above).
            </p>
            <label className="block text-sm">
              <span className="text-muted">Credits to buy (min 50)</span>
              <input
                type="number"
                min={50}
                max={50_000}
                step={50}
                className="mt-1 h-11 w-full max-w-xs rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-3 text-sm"
                value={credits}
                onChange={(e) => setCredits(Number.parseInt(e.target.value, 10) || 50)}
              />
            </label>
            <p className="text-sm">
              Estimated: <strong>{gelFromTetri(props.priceTetri * credits)}</strong>
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void checkout()}
              className="rounded-full bg-[color:var(--espresso)] px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
            >
              Pay with Stripe (credits)
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-14">
        <MedicalDisclaimerStrip />
      </div>
    </div>
  );
}
