"use client";

import { useEffect, useRef, useState } from "react";

export type SpatialInput = {
  /** normalized -1..1 */
  x: number;
  /** normalized -1..1 */
  y: number;
  /** true when deviceorientation is actively driving input */
  usingGyro: boolean;
};

/**
 * Unified spatial input for mobile/desktop:
 * - Desktop: mousemove
 * - Mobile: touchmove + deviceorientation (gyroscope)
 *
 * Keeps values stable and throttled by rAF via refs.
 */
export function useSpatialInput(): SpatialInput {
  const [state, setState] = useState<SpatialInput>({ x: 0, y: 0, usingGyro: false });
  const latest = useRef({ x: 0, y: 0, usingGyro: false });
  const raf = useRef<number>(0);

  useEffect(() => {
    const commit = () => {
      setState({ ...latest.current });
      raf.current = 0;
    };
    const schedule = () => {
      if (raf.current) return;
      raf.current = window.requestAnimationFrame(commit);
    };

    const onMouse = (e: MouseEvent) => {
      latest.current.usingGyro = false;
      latest.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      latest.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      latest.current.usingGyro = latest.current.usingGyro; // keep if gyro active
      latest.current.x = (t.clientX / window.innerWidth) * 2 - 1;
      latest.current.y = (t.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      // beta: front-back (-180..180), gamma: left-right (-90..90)
      const beta = typeof e.beta === "number" ? e.beta : 0;
      const gamma = typeof e.gamma === "number" ? e.gamma : 0;

      // normalize gently
      const nx = Math.max(-1, Math.min(1, gamma / 30));
      const ny = Math.max(-1, Math.min(1, beta / 45));

      latest.current.usingGyro = true;
      latest.current.x = nx;
      latest.current.y = ny;
      schedule();
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("deviceorientation", onOrientation, true);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onOrientation, true);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return state;
}

