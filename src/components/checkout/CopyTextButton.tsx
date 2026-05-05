"use client";

import { useState } from "react";

export function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        });
      }}
      className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] transition-colors hover:border-[color:var(--hermes)]"
    >
      {done ? "Copied" : label}
    </button>
  );
}
