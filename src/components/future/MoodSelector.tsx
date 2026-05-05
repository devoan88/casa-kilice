"use client";

import { Moon, Sparkles, Sun } from "lucide-react";
import { motion } from "framer-motion";

import { useMood, type Mood } from "@/components/future/MoodProvider";

function MoodButton({
  id,
  label,
  children,
}: {
  id: Mood;
  label: string;
  children: React.ReactNode;
}) {
  const { mood, setMood } = useMood();
  const active = mood === id;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setMood(id)}
      className={[
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[color:var(--surface)] text-foreground transition-colors duration-500",
        active
          ? "border-[color:var(--hermes)]"
          : "hover:border-[color:color-mix(in_srgb,var(--hermes)_45%,var(--gold)_55%)]",
      ].join(" ")}
    >
      {active ? (
        <motion.div
          layoutId="mood-ring"
          className="absolute inset-0 rounded-full ring-2 ring-[color:color-mix(in_srgb,var(--hermes)_50%,var(--gold)_50%)]"
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}

export function MoodSelector() {
  return (
    <div className="fixed bottom-6 left-6 z-[80] flex items-center gap-2 rounded-full border border-border bg-[color:var(--surface)] p-2 shadow-[0_18px_50px_rgba(45,27,27,0.1)] backdrop-blur">
      <MoodButton id="sun" label="Sun mood">
        <Sun size={18} />
      </MoodButton>
      <MoodButton id="moon" label="Moon mood">
        <Moon size={18} />
      </MoodButton>
      <MoodButton id="sparkle" label="Sparkle mood">
        <Sparkles size={18} />
      </MoodButton>
    </div>
  );
}

