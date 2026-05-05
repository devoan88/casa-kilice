"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  active: boolean;
  /** Pass the child container */
  children: React.ReactNode;
  className?: string;
};

const CORNER_SIZE = 32;

/**
 * VR Holographic Scan overlay — wraps a target element with:
 *  - Corner frame brackets
 *  - Moving neon beam (vertical sweep)
 *  - Vertical "projection" light ray emanating upward
 *  - Floating data tags (TONE · GENDER · WELLNESS)
 *  - Pulsing outer glow ring
 */
export function HolographicScanBeam({ active, children, className = "" }: Props) {
  return (
    <div className={`relative ${className}`} style={{ isolation: "isolate" }}>
      {children}

      <AnimatePresence>
        {active && (
          <motion.div
            key="holo"
            className="pointer-events-none absolute inset-0 z-[8] overflow-hidden rounded-[inherit]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── fine grid ── */}
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(232,196,92,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(232,196,92,0.28) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* ── animated neon sweep beam ── */}
            <motion.div
              className="absolute inset-x-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(232,196,92,0.0) 8%, rgba(232,196,92,1) 40%, rgba(255,240,180,1) 50%, rgba(232,196,92,1) 60%, rgba(232,196,92,0.0) 92%, transparent 100%)",
                boxShadow: "0 0 32px 6px rgba(232,196,92,0.55), 0 0 80px 12px rgba(232,196,92,0.18)",
              }}
              initial={{ top: "4%" }}
              animate={{ top: ["4%", "96%", "4%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ── pulsing gold ring border ── */}
            <motion.div
              className="absolute inset-0 rounded-[inherit]"
              animate={{
                boxShadow: [
                  "inset 0 0 0 1.5px rgba(232,196,92,0.35), 0 0 0 1.5px rgba(232,196,92,0.20)",
                  "inset 0 0 0 1.5px rgba(232,196,92,0.90), 0 0 48px 6px rgba(232,196,92,0.32)",
                  "inset 0 0 0 1.5px rgba(232,196,92,0.35), 0 0 0 1.5px rgba(232,196,92,0.20)",
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ── corner brackets ── */}
            {/* top-left */}
            <div
              className="absolute left-3 top-3"
              style={{
                width: CORNER_SIZE,
                height: CORNER_SIZE,
                borderTop: "2px solid rgba(232,196,92,0.95)",
                borderLeft: "2px solid rgba(232,196,92,0.95)",
                filter: "drop-shadow(0 0 6px rgba(232,196,92,0.7))",
              }}
            />
            {/* top-right */}
            <div
              className="absolute right-3 top-3"
              style={{
                width: CORNER_SIZE,
                height: CORNER_SIZE,
                borderTop: "2px solid rgba(232,196,92,0.95)",
                borderRight: "2px solid rgba(232,196,92,0.95)",
                filter: "drop-shadow(0 0 6px rgba(232,196,92,0.7))",
              }}
            />
            {/* bottom-left */}
            <div
              className="absolute bottom-3 left-3"
              style={{
                width: CORNER_SIZE,
                height: CORNER_SIZE,
                borderBottom: "2px solid rgba(232,196,92,0.95)",
                borderLeft: "2px solid rgba(232,196,92,0.95)",
                filter: "drop-shadow(0 0 6px rgba(232,196,92,0.7))",
              }}
            />
            {/* bottom-right */}
            <div
              className="absolute bottom-3 right-3"
              style={{
                width: CORNER_SIZE,
                height: CORNER_SIZE,
                borderBottom: "2px solid rgba(232,196,92,0.95)",
                borderRight: "2px solid rgba(232,196,92,0.95)",
                filter: "drop-shadow(0 0 6px rgba(232,196,92,0.7))",
              }}
            />

            {/* ── floating HUD data tags ── */}
            {[
              { label: "TONE · READING", pos: "top-[10%] left-[10%]", delay: 0.1 },
              { label: "GENDER · DETECT", pos: "top-[10%] right-[8%]", delay: 0.2 },
              { label: "DEPTH · SCAN", pos: "bottom-[12%] left-[8%]", delay: 0.3 },
              { label: "WELLNESS · ID", pos: "bottom-[12%] right-[8%]", delay: 0.4 },
            ].map((tag) => (
              <motion.div
                key={tag.label}
                className={`absolute ${tag.pos} flex items-center gap-1`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tag.delay, duration: 0.4 }}
              >
                <motion.span
                  className="inline-block h-[5px] w-[5px] rounded-full bg-[color:rgba(232,196,92,0.95)]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ boxShadow: "0 0 6px rgba(232,196,92,0.8)" }}
                />
                <span
                  className="font-mono text-[7px] uppercase tracking-[0.14em]"
                  style={{ color: "rgba(232,196,92,0.78)" }}
                >
                  {tag.label}
                </span>
              </motion.div>
            ))}

            {/* ── center crosshair ── */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                style={{ width: 40, height: 40 }}
              >
                <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
                  <circle cx="20" cy="20" r="8" stroke="rgba(232,196,92,0.7)" strokeWidth="1" />
                  <line x1="20" y1="0" x2="20" y2="10" stroke="rgba(232,196,92,0.55)" strokeWidth="1" />
                  <line x1="20" y1="30" x2="20" y2="40" stroke="rgba(232,196,92,0.55)" strokeWidth="1" />
                  <line x1="0" y1="20" x2="10" y2="20" stroke="rgba(232,196,92,0.55)" strokeWidth="1" />
                  <line x1="30" y1="20" x2="40" y2="20" stroke="rgba(232,196,92,0.55)" strokeWidth="1" />
                  <circle cx="20" cy="20" r="2" fill="rgba(232,196,92,0.9)" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── holographic projection ray upward from top edge ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="proj-ray"
            className="pointer-events-none absolute left-1/2 z-[7] -translate-x-1/2"
            style={{ bottom: "100%", width: "60%", height: "120px" }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="h-full w-full origin-bottom"
              style={{
                background:
                  "linear-gradient(to top, rgba(232,196,92,0.18) 0%, rgba(232,196,92,0.06) 40%, transparent 100%)",
                clipPath: "polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
