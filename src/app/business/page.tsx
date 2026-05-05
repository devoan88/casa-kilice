import type { Metadata } from "next";
import Link from "next/link";

import { MedicalDisclaimerStrip } from "@/components/legal/MedicalDisclaimerStrip";

export const metadata: Metadata = {
  title: "Business Solutions — AI Skin & Wellness API",
  description:
    "Partner tiers for Casa Kilicé Wellness Intelligence: AI Skin Scan, personalized vitamin-style guidance, Virtual Makeup Artist API, and branded widgets.",
  keywords: [
    "AI Skin Scan",
    "Personalized Vitamin Guide",
    "Virtual Makeup Artist API",
    "Skin Health Algorithm",
    "Wellness Intelligence API",
  ],
};

const tiers = [
  {
    name: "Starter (Small Salon)",
    price: "$49 / month",
    stripeNote: "Stripe Basic subscription — configure price ID to $49 in Dashboard.",
    features: ["100 scans per month", "Core makeup placement recommendations", "Email onboarding"],
  },
  {
    name: "Professional (Clinic)",
    price: "$149 / month",
    stripeNote: "Higher caps or custom price — start from Skin API then request Professional billing.",
    features: ["500 scans per month", "Full vitamin & routine-style analysis modules", "Priority support"],
  },
  {
    name: "Enterprise (Global Brand)",
    price: "$499 / month",
    stripeNote: "Stripe Premium subscription — unlimited scans (fair use) when price ID matches $499.",
    features: ["Unlimited scans (fair use)", "API access", "Branded embed widget", "Custom SLAs on request"],
  },
] as const;

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">For partners · Business solutions</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[color:var(--espresso)] md:text-5xl">
        Wellness Intelligence for your brand
      </h1>
      <p className="mt-4 text-lg text-muted">
        Integrate Casa Kilicé&apos;s vision pipeline into your site or app: undertone and depth, texture-aware reads,
        holistic wellness-style modules (skincare habits, lifestyle patterns, sun safety), and Casa Kilicé product
        mapping — exposed via REST API and optional embeddable widget.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="flex flex-col rounded-[24px] border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_96%,transparent)] p-6 shadow-[0_12px_40px_rgba(45,27,27,0.06)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{t.name}</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl text-foreground">{t.price}</p>
            <p className="mt-2 text-[11px] leading-snug text-muted">{t.stripeNote}</p>
            <ul className="mt-4 flex-1 list-disc space-y-2 pl-5 text-sm text-muted marker:text-[color:var(--hermes)]">
              {t.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link
              href="/skin-api"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--espresso)] px-6 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] transition-opacity hover:opacity-95"
            >
              Open Skin API billing
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[24px] border border-border bg-[color:var(--surface)] p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Integration</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Technical partners start from the{" "}
          <Link href="/skin-api" className="underline decoration-[color:var(--hermes)] underline-offset-4 hover:text-foreground">
            Skin API
          </Link>{" "}
          console: API keys, metered billing, and the licensed <code className="text-[11px]">casa-skin-widget.js</code>{" "}
          script. Enterprise adds white-label surfaces and higher throughput — contact the team after registration.
        </p>
      </div>

      <div className="mt-8">
        <MedicalDisclaimerStrip />
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.28em] text-muted">
        <Link href="/journal/how-ai-changes-beauty-care" className="hover:text-[color:var(--hermes)]">
          Journal — How AI is reshaping beauty
        </Link>
      </p>
    </div>
  );
}
