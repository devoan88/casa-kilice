"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Extra resting depth in px — middle cards float higher */
  depthZ?: number;
  /** 0–1 glow intensity */
  glowStrength?: number;
  noTilt?: boolean;
};

/**
 * VisionOS Spatial Glass Card — exactly the Apple Vision Pro window feel.
 * Uses the same mouse-spring pattern but fixes Rules of Hooks:
 * ALL hooks at top level, no calls inside conditionals or JSX.
 */
export function SpatialCard({
  children,
  className = "",
  depthZ = 0,
  glowStrength = 1,
  noTilt = false,
}: Props) {
  // ── motion values (always called, no conditions) ──
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const scaleVal = useSpring(1, { stiffness: 300, damping: 28 });

  const mouseXSpring = useSpring(rawX, { stiffness: 150, damping: 22 });
  const mouseYSpring = useSpring(rawY, { stiffness: 150, damping: 22 });

  // Degrees match Apple Vision Pro window tilt — 15° max
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  // Glow follows cursor — computed at top level (Rules of Hooks)
  const glowX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const glowBackground = useTransform([glowX, glowY], ([x, y]) => {
    const xp = typeof x === "number" ? x : 50;
    const yp = typeof y === "number" ? y : 50;
    const alpha = (0.18 * glowStrength).toFixed(3);
    return `radial-gradient(circle at ${xp}% ${yp}%, rgba(232,196,92,${alpha}) 0%, rgba(255,240,160,0.04) 40%, transparent 65%)`;
  });

  // Specular highlight moves opposite to cursor (physical glass refraction)
  const specularX = useTransform(mouseXSpring, [-0.5, 0.5], [80, 20]);
  const specularY = useTransform(mouseYSpring, [-0.5, 0.5], [20, 80]);
  const specularBackground = useTransform([specularX, specularY], ([sx, sy]) => {
    const x = typeof sx === "number" ? sx : 50;
    const y = typeof sy === "number" ? sy : 50;
    return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18) 0%, transparent 45%)`;
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (noTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    scaleVal.set(1.028);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
    scaleVal.set(1);
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[28px] ${className}`}
      style={
        noTilt
          ? {
              scale: scaleVal,
              boxShadow:
                "0 48px 120px rgba(0,0,0,0.65), 0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09)",
              background:
                "linear-gradient(145deg, rgba(28,25,22,0.82) 0%, rgba(14,12,10,0.78) 60%, rgba(22,19,16,0.80) 100%)",
              backdropFilter: "blur(50px) saturate(1.5)",
              WebkitBackdropFilter: "blur(50px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.09)",
            }
          : {
              rotateX,
              rotateY,
              scale: scaleVal,
              translateZ: depthZ,
              transformStyle: "preserve-3d",
              boxShadow:
                "0 48px 120px rgba(0,0,0,0.65), 0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(232,196,92,0.08), inset 0 1px 0 rgba(255,255,255,0.09)",
              background:
                "linear-gradient(145deg, rgba(28,25,22,0.82) 0%, rgba(14,12,10,0.78) 60%, rgba(22,19,16,0.80) 100%)",
              backdropFilter: "blur(50px) saturate(1.5)",
              WebkitBackdropFilter: "blur(50px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,0.09)",
            }
      }
      onPointerMove={handlePointerMove}
      onPointerDown={(e) => {
        if (noTilt) return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }}
      onPointerUp={(e) => {
        if (noTilt) return;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        handlePointerLeave();
      }}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
    >
      {/* Cursor-following gold glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[0] rounded-[inherit]"
        style={{ background: glowBackground }}
      />

      {/* Dynamic specular highlight (glass refraction) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: specularBackground }}
      />

      {/* Physical white inner-edge (the glass rim) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.11) 0%, transparent 42%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.14), inset 1px 0 0 rgba(255,255,255,0.04)",
        }}
      />

      {/* Holographic sheen sweep */}
      <div
        aria-hidden
        className="ck-holo-sheen pointer-events-none absolute inset-0 z-[3] rounded-[inherit]"
      />

      {/* Content — floats in front of all glass layers */}
      <div className="relative z-[4]" style={{ transform: "translateZ(18px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
