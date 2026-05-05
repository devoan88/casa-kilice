"use client";

import { motion } from "framer-motion";

const spots = [
  { x: "8%", y: "12%", d: 2.4 },
  { x: "22%", y: "8%", d: 3.1 },
  { x: "78%", y: "18%", d: 2.8 },
  { x: "88%", y: "42%", d: 3.4 },
  { x: "12%", y: "55%", d: 2.6 },
  { x: "55%", y: "68%", d: 3.0 },
  { x: "70%", y: "82%", d: 2.9 },
  { x: "40%", y: "22%", d: 3.2 },
];

export function VelvetSparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {spots.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-[color:color-mix(in_srgb,var(--hermes)_45%,var(--gold)_55%)]"
          style={{ left: s.x, top: s.y }}
          animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.9, 1.35, 0.9] }}
          transition={{
            duration: s.d,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  );
}
