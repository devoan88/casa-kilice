export default function ExclusiveOffersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-20">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted">
        The Secret Garden
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight md:text-5xl">
        Exclusive Offers
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-muted md:text-base">
        Private releases and quiet invitations. This page is intentionally minimal
        for now—ready to be connected to VIP tiers, bundles, and limited drops.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Inner Circle Drop",
            text: "Limited units, atelier-first access. Worldwide insured delivery via DHL, FedEx, or Aramex — quoted at checkout.",
          },
          {
            title: "Ritual Set",
            text: "A curated pairing designed for morning glow and evening velvet.",
          },
          {
            title: "Gold Emboss Invitation",
            text: "Members receive private offers and early previews.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-[28px] border border-border bg-[color:var(--surface)] p-6 shadow-[0_18px_50px_rgba(45,27,27,0.1)]"
          >
            <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
              {c.title}
            </p>
            <p className="mt-2 text-sm text-muted">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

