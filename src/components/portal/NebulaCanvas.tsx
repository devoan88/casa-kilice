"use client";

import { useEffect, useRef } from "react";

import { useSpatialInput } from "@/components/portal/useSpatialInput";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
};

function makeParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: Math.random() * 1.8 + 0.4,
    opacity: Math.random() * 0.55 + 0.12,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.012 + 0.004,
  };
}

const COUNT = 88;
const CONNECT_DIST = 115;
const MOUSE_REPEL = 90;
const MOUSE_FORCE = 0.018;

/** Interactive nebula particle field — mouse-reactive, neon-gold palette. */
export function NebulaCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const frame = useRef<number>(0);
  const input = useSpatialInput();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    let particles: Particle[] = [];

    const init = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      particles = Array.from({ length: COUNT }, () => makeParticle(W, H));
    };

    init();

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // Unified spatial input: mouse/touch/gyro normalized -> local coordinates
      const rect = canvas.getBoundingClientRect();
      const mx = rect.width * (input.x * 0.5 + 0.5);
      const my = rect.height * (input.y * 0.5 + 0.5);

      for (const p of particles) {
        p.pulse += p.pulseSpeed;

        // mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL && dist > 0) {
          const force = ((MOUSE_REPEL - dist) / MOUSE_REPEL) * MOUSE_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // damping
        p.vx *= 0.988;
        p.vy *= 0.988;

        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        if (p.y < -4) p.y = H + 4;
        if (p.y > H + 4) p.y = -4;

        const pulsed = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

        // gold hue gradient per particle
        const gold = `rgba(232, 196, 92, ${pulsed})`;
        const warm = `rgba(200, 162, 72, ${pulsed * 0.65})`;

        // draw dot
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.2);
        grad.addColorStop(0, gold);
        grad.addColorStop(0.4, warm);
        grad.addColorStop(1, "rgba(200, 140, 40, 0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]!;
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = ((CONNECT_DIST - d) / CONNECT_DIST) * 0.14;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(232, 196, 92, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      frame.current = requestAnimationFrame(draw);
    };

    frame.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", onResize);
    };
  }, [input.x, input.y]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
