"use client";

import { motion } from "framer-motion";

import { NebulaCanvas } from "./NebulaCanvas";

/** Site-wide nebula field + gold haze — sits behind content (pointer-events none). */
export function DigitalAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Interactive particle nebula — pointer-events re-enabled for mouse tracking */}
      <div className="pointer-events-auto absolute inset-0 opacity-[0.38]">
        <NebulaCanvas className="h-full w-full" />
      </div>

      {/* Radial gold crown haze */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.15, 0.24, 0.15] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 90% 55% at 50% -15%, rgba(212, 175, 55, 0.13), transparent 55%)",
            "radial-gradient(ellipse 60% 40% at 100% 20%, rgba(60, 53, 48, 0.06), transparent 50%)",
          ].join(","),
        }}
      />

      {/* Fine gold grid */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212, 175, 55, 0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.45) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
    </div>
  );
}
