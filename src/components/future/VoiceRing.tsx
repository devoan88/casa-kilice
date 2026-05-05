"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useMemo, useState } from "react";

import { useMood } from "@/components/future/MoodProvider";

export function VoiceRing() {
  const { mood } = useMood();
  const [open, setOpen] = useState(false);

  const rec = useMemo(() => {
    if (mood === "moon") return "Velvet Nocturne — velvet finish for night light.";
    if (mood === "sparkle")
      return "Lumière Divine — a luminous veil for a polished glow.";
    return "Soleil d'Or — warm radiance with a soft bronze touch.";
  }, [mood]);

  return (
    <>
      <button
        type="button"
        aria-label="Voice command"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[80] inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--hermes)_55%,var(--gold)_45%)] bg-[color:var(--surface)] text-[color:var(--espresso)] shadow-[0_18px_50px_rgba(45,27,27,0.1)] transition-shadow duration-500 hover:shadow-[0_22px_55px_rgba(139,0,0,0.18)]"
      >
        <span className="absolute inset-0 rounded-full ring-2 ring-[color:rgba(243,229,171,0.38)] opacity-40" />
        <motion.span
          className="absolute inset-0 rounded-full border border-[color:color-mix(in_srgb,var(--hermes)_40%,var(--gold)_60%)]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.05, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Mic size={18} />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-[color:rgba(45,27,27,0.46)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-[100] w-[520px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-border bg-[color:var(--surface-strong)] p-7 text-center shadow-[0_30px_90px_rgba(45,27,27,0.12)]"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <p className="text-xs tracking-[0.28em] uppercase text-muted">
                Voice Concierge
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                I am listening to your beauty needs…
              </p>
              <p className="mt-4 text-sm text-muted">
                Curated recommendation:
                <span className="ml-2 text-foreground">{rec}</span>
              </p>
              <button
                className="ck-metallic mt-6 inline-flex h-11 w-full items-center justify-center rounded-full px-6 text-xs tracking-[0.22em] uppercase"
                onClick={() => setOpen(false)}
              >
                Continue
              </button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

