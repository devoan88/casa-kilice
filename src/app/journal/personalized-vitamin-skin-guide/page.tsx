import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personalized Vitamin-Style Guidance & Skin Signals",
  description:
    "Personalized Vitamin Guide: how omega-3, vitamin D, collagen, and antioxidants map to lifestyle — without replacing your doctor.",
  keywords: ["Personalized Vitamin Guide", "AI Skin Scan", "omega-3", "vitamin D", "skin wellness"],
};

export default function JournalArticleVitaminGuidePage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Casa Kilicé Journal</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[color:var(--espresso)]">
        Personalized vitamin-style guidance starts with context
      </h1>
      <p className="mt-4 text-sm text-muted">Editorial · Wellness literacy</p>

      <div className="prose prose-neutral mt-10 max-w-none text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_88%,#333)] prose-p:mb-4">
        <p>
          A useful <strong>Personalized Vitamin Guide</strong> does not dump milligrams from a blog post. It connects
          diet patterns, sun exposure, sleep, and visible skin stress — then suggests categories (for example{" "}
          <em>omega-3</em> fatty acids, <em>vitamin D</em> when labs support it, or protein-rich meals that support
          collagen synthesis) for discussion with a clinician.
        </p>
        <p>
          Photo-based apps sit on a narrow ledge: they can encourage hydration, barrier repair, and antioxidant-rich
          foods without claiming to measure blood levels. The <strong>AI Skin Scan</strong> output should always be
          paired with plain-language limits: no diagnosis, no prescription, and a clear path to professional care.
        </p>
        <p>
          Retailers that get this right see fewer chargebacks and happier customers, because expectations match what
          software can actually see — texture, tone cues, and behavioural prompts — not hidden biomarkers.
        </p>
      </div>

      <p className="mt-12 text-center text-sm">
        <Link href="/business" className="me-6 text-[color:var(--hermes)] underline underline-offset-4">
          Partner API &amp; tiers
        </Link>
        <Link href="/journal" className="text-[color:var(--hermes)] underline underline-offset-4">
          ← Journal home
        </Link>
      </p>
    </article>
  );
}
