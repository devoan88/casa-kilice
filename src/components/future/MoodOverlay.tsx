"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMood } from "@/components/future/MoodProvider";

export function MoodOverlay() {
  const { mood } = useMood();

  const styleByMood: Record<string, string> = {
    sun: "bg-[radial-gradient(circle_at_25%_20%,rgba(60,53,48,0.05),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(220,207,191,0.35),transparent_60%)]",
    moon:
      "bg-[radial-gradient(circle_at_35%_25%,rgba(60,53,48,0.05),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(232,223,212,0.4),transparent_60%)]",
    sparkle:
      "bg-[radial-gradient(circle_at_30%_30%,rgba(60,53,48,0.06),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(208,196,181,0.25),transparent_60%)]",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood}
        className={[
          "pointer-events-none fixed inset-0 z-[5] transition-opacity",
          styleByMood[mood],
        ].join(" ")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </AnimatePresence>
  );
}

