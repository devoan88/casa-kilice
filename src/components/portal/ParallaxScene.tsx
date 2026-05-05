"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Single-element mouse parallax float.
 * strength 0 = static, 1 = maximum 18px/12px movement.
 * ALL hooks at top level — no loops, no conditionals.
 */
export function ParallaxFloat({
  children,
  strength = 0.5,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 55, damping: 20 });
  const smoothY = useSpring(rawY, { stiffness: 55, damping: 20 });
  const tx = useTransform(smoothX, [-1, 1], [-18 * strength, 18 * strength]);
  const ty = useTransform(smoothY, [-1, 1], [-12 * strength, 12 * strength]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <motion.div style={{ x: tx, y: ty, willChange: "transform" }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Two-layer parallax container — background (depth 0) + foreground (depth 1).
 * Use this for sections where you want the background to lag behind content.
 */
export function ParallaxTwoLayer({
  background,
  foreground,
  className = "",
}: {
  background: ReactNode;
  foreground: ReactNode;
  className?: string;
}) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 45, damping: 18 });
  const smoothY = useSpring(rawY, { stiffness: 45, damping: 18 });

  // background moves at 20% of mouse offset
  const bgX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const bgY = useTransform(smoothY, [-1, 1], [-6, 6]);
  // foreground moves at 50%
  const fgX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const fgY = useTransform(smoothY, [-1, 1], [-14, 14]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ x: bgX, y: bgY, willChange: "transform" }}
        className="absolute inset-[-4%] z-0"
      >
        {background}
      </motion.div>
      <motion.div
        style={{ x: fgX, y: fgY, willChange: "transform" }}
        className="relative z-10"
      >
        {foreground}
      </motion.div>
    </div>
  );
}
