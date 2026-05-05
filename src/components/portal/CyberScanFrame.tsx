"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

const COORDS = [
  { top: "12%", left: "8%", label: "TONE.DEPTH" },
  { top: "12%", right: "8%", label: "TEXTURE.MAP" },
  { bottom: "14%", left: "8%", label: "GENDER.READ" },
  { bottom: "14%", right: "8%", label: "WELLNESS.ID" },
];

const DATA_POINTS = [
  { top: "28%", left: "18%", label: "UV", value: "SPF-ZONE" },
  { top: "45%", right: "14%", label: "HYD", value: "SIGNAL" },
  { bottom: "30%", left: "22%", label: "ELK", value: "READING" },
];

/** HUD-style scanner with corner brackets, coordinates, and animated scan line. */
export function CyberScanFrame({
  active,
  className = "rounded-[32px]",
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {active ? (
          <motion.div
            key="hud"
            className={`pointer-events-none absolute inset-0 z-[2] overflow-hidden ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* grid overlay */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(232,196,92,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,196,92,0.25) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* scan line */}
            <motion.div
              className="absolute inset-x-0 h-[2px] bg-[linear-gradient(90deg,transparent,rgba(232,196,92,1),transparent)] shadow-[0_0_28px_4px_rgba(232,196,92,0.55)]"
              initial={{ top: "6%" }}
              animate={{ top: ["6%", "94%", "6%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* pulsing gold border */}
            <motion.div
              className="absolute inset-0 rounded-[inherit] border-2 border-[color:color-mix(in_srgb,rgba(232,196,92)_70%,transparent)]"
              animate={{
                opacity: [0.4, 0.9, 0.4],
                boxShadow: [
                  "0 0 0 0 rgba(232,196,92,0)",
                  "0 0 40px 4px rgba(232,196,92,0.3), inset 0 0 40px 4px rgba(232,196,92,0.1)",
                  "0 0 0 0 rgba(232,196,92,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* corner bracket — top-left */}
            <div className="absolute left-3 top-3 h-7 w-7 border-l-[2px] border-t-[2px] border-[color:rgba(232,196,92,0.9)]" />
            {/* corner bracket — top-right */}
            <div className="absolute right-3 top-3 h-7 w-7 border-r-[2px] border-t-[2px] border-[color:rgba(232,196,92,0.9)]" />
            {/* corner bracket — bottom-left */}
            <div className="absolute bottom-3 left-3 h-7 w-7 border-b-[2px] border-l-[2px] border-[color:rgba(232,196,92,0.9)]" />
            {/* corner bracket — bottom-right */}
            <div className="absolute bottom-3 right-3 h-7 w-7 border-b-[2px] border-r-[2px] border-[color:rgba(232,196,92,0.9)]" />

            {/* coordinate labels */}
            {COORDS.map((c, i) => (
              <motion.p
                key={i}
                className="absolute font-mono text-[8px] uppercase tracking-[0.18em] text-[color:rgba(232,196,92,0.85)]"
                style={c as React.CSSProperties}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.6 }}
              >
                {c.label}
              </motion.p>
            ))}

            {/* floating data points */}
            {DATA_POINTS.map((d, i) => (
              <motion.div
                key={i}
                className="absolute flex items-center gap-1.5"
                style={d as React.CSSProperties}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.18 + 0.5, duration: 0.5 }}
              >
                <span className="h-[5px] w-[5px] rounded-full bg-[color:rgba(232,196,92,0.9)] shadow-[0_0_6px_rgba(232,196,92,0.8)]" />
                <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-[color:rgba(232,196,92,0.82)]">
                  {d.label}: <span className="opacity-70">{d.value}</span>
                </span>
              </motion.div>
            ))}

            {/* center crosshair */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="h-6 w-6"
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
                  <circle cx="12" cy="12" r="4" stroke="rgba(232,196,92,0.8)" strokeWidth="1" />
                  <line x1="12" y1="0" x2="12" y2="6" stroke="rgba(232,196,92,0.6)" strokeWidth="1" />
                  <line x1="12" y1="18" x2="12" y2="24" stroke="rgba(232,196,92,0.6)" strokeWidth="1" />
                  <line x1="0" y1="12" x2="6" y2="12" stroke="rgba(232,196,92,0.6)" strokeWidth="1" />
                  <line x1="18" y1="12" x2="24" y2="12" stroke="rgba(232,196,92,0.6)" strokeWidth="1" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
