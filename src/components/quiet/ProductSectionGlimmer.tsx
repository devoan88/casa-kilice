"use client";

/** Subtle floating gold motes behind the product grid. */
export function ProductSectionGlimmer() {
  const spots = [
    { t: "12%", l: "8%", d: 4.2, delay: 0 },
    { t: "22%", l: "78%", d: 5.1, delay: 0.4 },
    { t: "48%", l: "14%", d: 3.8, delay: 0.2 },
    { t: "62%", l: "88%", d: 4.6, delay: 0.7 },
    { t: "78%", l: "42%", d: 5.4, delay: 0.1 },
    { t: "34%", l: "52%", d: 3.5, delay: 0.9 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {spots.map((s, i) => (
        <span
          key={i}
          className="ck-glimmer-dot absolute h-1 w-1 rounded-full bg-[color:color-mix(in_srgb,var(--hermes)_42%,var(--gold)_18%)]"
          style={{
            top: s.t,
            left: s.l,
            animationDuration: `${s.d}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className="ck-glimmer-sheen absolute inset-0 opacity-40" />
    </div>
  );
}
