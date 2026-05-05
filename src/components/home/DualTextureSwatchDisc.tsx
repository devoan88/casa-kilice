"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { DUAL_TEXTURE_PALETTE } from "@/lib/dualTexturePalette";
import type { ProductTone } from "@/lib/products";

type DustParticle = { id: number; x: number; y: number };

/**
 * Wraps the powder disc; while `active`, mouse movement spawns short-lived micro-dust specks.
 */
export function DualTexturePowderDustTrail({
  active,
  dustColor,
  children,
  className,
}: {
  active: boolean;
  /** Defaults to light toasted wheat when omitted. */
  dustColor?: string;
  children: ReactNode;
  className?: string;
}) {
  const [particles, setParticles] = useState<DustParticle[]>([]);
  const nextId = useRef(0);
  const lastSpawn = useRef(0);
  const dc = dustColor ?? DUAL_TEXTURE_PALETTE.powder;

  useEffect(() => {
    if (!active) setParticles([]);
  }, [active]);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!active) return;
      const now = performance.now();
      if (now - lastSpawn.current < 42) return;
      lastSpawn.current = now;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / Math.max(r.width, 1)) * 100;
      const y = ((e.clientY - r.top) / Math.max(r.height, 1)) * 100;
      const id = nextId.current++;
      setParticles((prev) => [...prev.slice(-32), { id, x, y }]);
    },
    [active],
  );

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className={["relative", className].filter(Boolean).join(" ")} onMouseMove={onMove}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="dual-powder-dust-particle pointer-events-none absolute z-[2]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `color-mix(in srgb, ${dc} 52%, #f5ebe0 48%)`,
            boxShadow: `0 0 4px color-mix(in srgb, ${dc} 50%, transparent), 0 0 9px color-mix(in srgb, ${dc} 28%, transparent)`,
          }}
          onAnimationEnd={() => removeParticle(p.id)}
        />
      ))}
      {children}
    </div>
  );
}

/** Matte tinted powder — optional `baseColor` overrides default light tone. */
export function DualTexturePowderDisc({
  sizePx,
  baseColor,
  className,
}: {
  sizePx: number;
  baseColor?: string;
  className?: string;
}) {
  const c = baseColor ?? DUAL_TEXTURE_PALETTE.powder;
  return (
    <div
      className={[
        "relative z-[1] shrink-0 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: sizePx,
        minWidth: sizePx,
        height: sizePx,
        minHeight: sizePx,
        backgroundColor: c,
        backgroundImage: [
          "radial-gradient(circle at 22% 30%, rgba(62,38,22,0.09) 0.5px, transparent 0.65px)",
          "radial-gradient(circle at 74% 64%, rgba(48,30,18,0.075) 0.48px, transparent 0.62px)",
          "radial-gradient(circle at 50% 18%, rgba(55,34,20,0.065) 0.52px, transparent 0.68px)",
          "radial-gradient(circle at 12% 80%, rgba(70,44,26,0.055) 0.44px, transparent 0.58px)",
          "radial-gradient(circle at 86% 38%, rgba(52,32,18,0.06) 0.5px, transparent 0.64px)",
          "radial-gradient(circle at 38% 70%, rgba(40,24,14,0.05) 0.42px, transparent 0.56px)",
          "radial-gradient(circle at 68% 46%, rgba(78,48,28,0.045) 0.4px, transparent 0.54px)",
          "radial-gradient(circle at 58% 88%, rgba(35,22,14,0.04) 0.38px, transparent 0.52px)",
        ].join(","),
        boxShadow: [
          "inset 0 10px 28px rgba(28,16,10,0.18)",
          "inset 0 -8px 22px rgba(22,12,8,0.12)",
          "inset 0 0 0 1px rgba(22,14,10,0.06)",
          "inset 0 1px 0 rgba(255,248,240,0.12)",
          "0 16px 40px rgba(35,20,12,0.12)",
        ].join(", "),
        filter: "saturate(1.06)",
      }}
    />
  );
}

/** Glossy cream pan — `tone: deep` adds richer specular / “melted” read. */
export function DualTextureCreamDisc({
  sizePx,
  sheenActive = false,
  baseColor,
  tone = "light",
  className,
}: {
  sizePx: number;
  sheenActive?: boolean;
  baseColor?: string;
  tone?: ProductTone;
  className?: string;
}) {
  const base = baseColor ?? DUAL_TEXTURE_PALETTE.creamBronzer;
  const isDeep = tone === "deep";
  const hi = isDeep ? 0.62 : 0.52;
  const rim = isDeep ? 0.55 : 0.45;
  const glossLift = isDeep ? "#ffd4a8" : "#ffd8a8";
  const deepMix = isDeep ? "82%" : "78%";

  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: sizePx,
        minWidth: sizePx,
        height: sizePx,
        minHeight: sizePx,
        background: `linear-gradient(152deg,
          color-mix(in srgb, ${base} 52%, ${glossLift} 48%) 0%,
          ${base} 38%,
          color-mix(in srgb, ${base} ${deepMix}, #1a0c06 22%) 100%)`,
        boxShadow: isDeep
          ? "inset 0 -22px 44px rgba(8,4,2,0.42), inset 0 4px 0 rgba(255,235,210,0.32), 0 24px 56px rgba(20,8,4,0.28), 0 0 0 1px rgba(255,200,150,0.14)"
          : "inset 0 -18px 36px rgba(20,10,6,0.35), inset 0 3px 0 rgba(255,245,230,0.28), 0 22px 52px rgba(45,22,12,0.18), 0 0 0 1px rgba(255,220,180,0.12)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full opacity-90"
        style={{
          background: `radial-gradient(ellipse 90% 88% at 50% 58%,
            color-mix(in srgb, ${base} 20%, transparent),
            transparent 70%)`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -left-[8%] -top-[18%] h-[52%] w-[58%] rounded-full"
        style={{
          background: `radial-gradient(ellipse 72% 58% at 62% 48%, rgba(255,255,255,${hi}) 0%, rgba(255,220,190,${isDeep ? 0.32 : 0.22}) 28%, transparent 62%)`,
          filter: "blur(5px)",
        }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute left-[22%] top-[14%] h-[22%] w-[36%] rounded-full blur-md ${isDeep ? "bg-white/35" : "bg-white/25"}`}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -right-[5%] bottom-[12%] h-[45%] w-[40%] rounded-full opacity-70"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, rgba(255,200,150,${rim}), transparent 68%)`,
          filter: "blur(10px)",
        }}
        aria-hidden
      />

      <div
        className={[
          "pointer-events-none absolute -inset-[55%] rounded-full transition-opacity duration-500",
          sheenActive ? "dual-cream-liquid-sheen opacity-[0.85]" : "opacity-0",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background: `conic-gradient(
            from 200deg at 50% 50%,
            transparent 0deg,
            rgba(255,255,255,${isDeep ? 0.45 : 0.38}) 32deg,
            transparent 58deg,
            rgba(255,210,170,${isDeep ? 0.48 : 0.42}) 118deg,
            transparent 165deg,
            rgba(255,255,255,${isDeep ? 0.34 : 0.28}) 220deg,
            transparent 360deg
          )`,
        }}
        aria-hidden
      />
    </div>
  );
}
