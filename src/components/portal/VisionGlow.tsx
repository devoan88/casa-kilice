"use client";

import { useEffect, useRef } from "react";

import { useSpatialInput } from "@/components/portal/useSpatialInput";

/**
 * VisionOS-style cursor flashlight — a large, soft radial gradient follows
 * the mouse at a slight lag, making the dark background feel like a 3-D
 * holographic space lit by a moving spotlight.
 */
export function VisionGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const input = useSpatialInput();

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let cx = -9999;
    let cy = -9999;

    const tick = () => {
      // Soft lerp — glow trails at ~8 % speed for dreamy lag
      const tx = (input.x * 0.5 + 0.5) * window.innerWidth;
      const ty = (input.y * 0.5 + 0.5) * window.innerHeight;

      cx += (tx - cx) * 0.072;
      cy += (ty - cy) * 0.072;

      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, [input.x, input.y]);

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="pointer-events-none fixed z-[2] -translate-x-1/2 -translate-y-1/2"
      style={{
        width: "640px",
        height: "640px",
        background:
          "radial-gradient(circle at 50% 50%, rgba(232,196,92,0.075) 0%, rgba(232,196,92,0.03) 32%, transparent 68%)",
        mixBlendMode: "screen",
        willChange: "left, top",
      }}
    />
  );
}
