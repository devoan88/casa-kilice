import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Casa Kilicé",
  description: "Terms of Service including IP and licensing for Casa Kilicé digital services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Legal</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[color:var(--espresso)]">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-muted">
        This page summarizes binding use terms for Casa Kilicé websites, APIs, and Beauty Tech offerings. For commerce
        terms (shipping, returns, consumer rights), refer to your checkout agreements and local law. Nothing here is
        legal advice; consult counsel for your situation.
      </p>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-muted">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--espresso)]">
          IP &amp; Licensing
        </h2>
        <p>
          <strong className="text-[color:var(--espresso)]">Proprietary AI Logic:</strong> The Skin-to-Product mapping
          algorithm, multi-use recommendation engine, and AI scanning interface are the exclusive intellectual property of
          Casa Kilicé. Any unauthorized reverse-engineering, scraping, or duplication of this logic for commercial use is
          strictly prohibited and protected by international copyright laws.
        </p>
        <p>
          Licensed API and embed access is granted only for domains and keys explicitly registered with Casa Kilicé.
          Automated probing, credential stuffing, or attempts to bypass domain verification violate these terms and may
          result in suspension without refund.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-sm leading-relaxed text-muted">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--espresso)]">Use of services</h2>
        <p>
          You agree not to misuse Casa Kilicé infrastructure, including exceeding fair rate limits, reselling access
          outside your agreement, or processing unlawful content. We may suspend or terminate access to protect the
          platform and other customers.
        </p>
      </section>

      <Link
        href="/"
        className="mt-12 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] underline"
      >
        Back to home
      </Link>
    </div>
  );
}
