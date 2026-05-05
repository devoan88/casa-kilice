"use client";

import { motion } from "framer-motion";

type Tier = "SILK" | "GOLD" | "VELVET";

export function MembershipProgressRing({
  percent,
  tier,
  size = 112,
}: {
  percent: number;
  tier: Tier;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  const offset = c * (1 - p / 100);

  const track =
    tier === "VELVET"
      ? "stroke-[color:rgba(243,229,171,0.24)]"
      : "stroke-[color:rgba(235,225,210,0.16)]";
  const bar =
    tier === "VELVET"
      ? "stroke-[color:var(--gold)]"
      : tier === "GOLD"
        ? "stroke-[color:var(--gold)]"
        : "stroke-[color:var(--gold)]";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className={track}
          fill="none"
          strokeWidth={stroke}
          cx={size / 2}
          cy={size / 2}
          r={r}
        />
        <motion.circle
          className={bar}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p
          className={[
            "text-center font-[family-name:var(--font-display)] text-xl leading-none",
            tier === "VELVET" ? "text-[color:var(--gold-2)]" : "text-foreground",
          ].join(" ")}
        >
          {p}
          <span className="text-xs tracking-wide text-muted">%</span>
        </p>
      </div>
    </div>
  );
}
