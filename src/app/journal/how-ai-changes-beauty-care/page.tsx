import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How AI Is Reshaping the Beauty & Skin-Care Industry",
  description:
    "From AI Skin Scan to Skin Health Algorithm: why personalized vitamin-style guidance and Virtual Makeup Artist APIs are changing retail, clinics, and at-home rituals.",
  keywords: ["AI Skin Scan", "Skin Health Algorithm", "beauty AI", "personalized skincare", "Casa Kilicé"],
};

export default function JournalArticleAiBeautyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Casa Kilicé Journal</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[color:var(--espresso)]">
        How AI is reshaping beauty and skin wellness
      </h1>
      <p className="mt-4 text-sm text-muted">Editorial · Beauty tech</p>

      <div className="prose prose-neutral mt-10 max-w-none text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_88%,#333)] prose-p:mb-4">
        <p>
          Computer vision once lived in research labs; today it powers the <strong>AI Skin Scan</strong> moment consumers
          expect before they buy a foundation, a serum, or a supplement stack. When a model reads undertone, depth,
          and surface texture together — not colour alone — brands can explain <em>why</em> a product fits, not only{" "}
          <em>which</em> shade to pick.
        </p>
        <p>
          The next wave pairs complexion mapping with a <strong>Skin Health Algorithm</strong> that outputs structured
          habits: cleansing cadence, when to favour humectants over acids, and sun-smart behaviour tied to UV context.
          That is not a replacement for dermatology; it is a way to scale education and triage interest before a human
          expert steps in.
        </p>
        <p>
          For businesses, a <strong>Virtual Makeup Artist API</strong> turns the same pipeline into a widget on a
          salon site or a checkout upsell on a global brand — metered, brand-safe, and easy to A/B test. Casa Kilicé
          publishes partner tiers so clinics and creators can grow into the stack without rebuilding vision models
          in-house.
        </p>
        <p>
          The honest tension in the industry is trust: the best implementations ship visible{" "}
          <strong>medical disclaimers</strong>, avoid dosages for ingestibles, and route high-risk concerns to licensed
          clinicians. AI should make routines clearer — not pretend to be a diagnosis.
        </p>
      </div>

      <p className="mt-12 text-center text-sm">
        <Link href="/journal" className="text-[color:var(--hermes)] underline underline-offset-4">
          ← Back to Journal
        </Link>
      </p>
    </article>
  );
}
