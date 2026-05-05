"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  active: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * 3D Holographic Face Scan — wraps the upload area.
 * Draws a perspective-projected light grid on a canvas that
 * morphs as the scan runs, like a real depth-sensing array.
 */
export function ScanLightGrid({ active, children, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    startRef.current = performance.now();

    const COLS = 18;
    const ROWS = 24;
    const VANISH_X = W / 2;
    const VANISH_Y = H * 0.48;
    const HORIZON = H * 0.45;

    const project = (gx: number, gy: number, t: number) => {
      // Wave distortion — looks like a face depth mesh
      const waveAmp = 8;
      const wave = Math.sin(gx * 0.8 + t * 2.2) * Math.sin(gy * 0.9 + t * 1.8) * waveAmp;

      const nx = gx / COLS - 0.5; // -0.5 → 0.5
      const ny = gy / ROWS;        // 0 → 1

      // Perspective factor (stronger at bottom)
      const pf = 0.4 + ny * 0.7;

      const sx = VANISH_X + nx * W * pf;
      const sy = HORIZON + ny * (H - HORIZON) * 0.9 + wave;
      return { sx, sy };
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const t = (now - startRef.current) / 1000;

      // Sweep beam progress (0 → 1 → 0 cycling)
      const sweep = (Math.sin(t * 1.1 - Math.PI / 2) + 1) / 2;
      const sweepY = HORIZON + sweep * (H - HORIZON);

      // ── Draw grid lines ──
      for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        for (let col = 0; col <= COLS; col++) {
          const { sx, sy } = project(col, row, t);
          if (col === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }

        // Rows near sweep beam glow brighter
        const dist = Math.abs(project(COLS / 2, row, t).sy - sweepY);
        const proximity = Math.max(0, 1 - dist / 80);
        const alpha = 0.12 + proximity * 0.65;

        ctx.strokeStyle = `rgba(232,196,92,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7 + proximity * 1.2;
        ctx.stroke();
      }

      for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        for (let row = 0; row <= ROWS; row++) {
          const { sx, sy } = project(col, row, t);
          if (row === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = "rgba(232,196,92,0.10)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── Sweep beam ──
      const grad = ctx.createLinearGradient(0, sweepY - 14, 0, sweepY + 14);
      grad.addColorStop(0, "rgba(232,196,92,0)");
      grad.addColorStop(0.5, "rgba(232,196,92,0.7)");
      grad.addColorStop(1, "rgba(232,196,92,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 14, W, 28);

      // ── Vertex dots at intersections ──
      for (let row = 0; row <= ROWS; row += 3) {
        for (let col = 0; col <= COLS; col += 3) {
          const { sx, sy } = project(col, row, t);
          const dist = Math.abs(sy - sweepY);
          const prox = Math.max(0, 1 - dist / 100);
          if (prox < 0.08) continue;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.8 + prox * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,196,92,${(prox * 0.85).toFixed(3)})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <div className={`relative ${className}`} style={{ isolation: "isolate" }}>
      {children}

      {/* Canvas grid overlay */}
      <AnimatePresence>
        {active && (
          <motion.canvas
            key="scan-grid"
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-[8] rounded-[inherit] h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ mixBlendMode: "screen" }}
          />
        )}
      </AnimatePresence>

      {/* Projection light beam — triangular ray upward */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="proj-beam"
            className="pointer-events-none absolute left-1/2 z-[7] -translate-x-1/2"
            style={{ bottom: "100%", width: "70%", height: "100px" }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="h-full w-full origin-bottom"
              style={{
                background:
                  "linear-gradient(to top, rgba(232,196,92,0.22) 0%, rgba(232,196,92,0.06) 50%, transparent 100%)",
                clipPath: "polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer glow ring */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="glow-ring"
            className="pointer-events-none absolute inset-0 z-[6] rounded-[inherit]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.4, 0.9, 0.4],
              boxShadow: [
                "inset 0 0 0 1.5px rgba(232,196,92,0.35), 0 0 0 2px rgba(232,196,92,0.15)",
                "inset 0 0 0 2px rgba(232,196,92,0.95), 0 0 60px 6px rgba(232,196,92,0.35)",
                "inset 0 0 0 1.5px rgba(232,196,92,0.35), 0 0 0 2px rgba(232,196,92,0.15)",
              ],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Corner brackets */}
      {active && (
        <>
          {[
            "absolute left-3 top-3 border-l-2 border-t-2",
            "absolute right-3 top-3 border-r-2 border-t-2",
            "absolute bottom-3 left-3 border-b-2 border-l-2",
            "absolute bottom-3 right-3 border-b-2 border-r-2",
          ].map((cls, i) => (
            <motion.div
              key={i}
              className={`${cls} pointer-events-none z-[9] h-8 w-8 border-[color:rgba(232,196,92,0.95)]`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              style={{ filter: "drop-shadow(0 0 6px rgba(232,196,92,0.7))" }}
            />
          ))}
        </>
      )}
    </div>
  );
}
