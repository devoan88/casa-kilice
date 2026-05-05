"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Mood = "sun" | "moon" | "sparkle";

type MoodState = {
  mood: Mood;
  setMood: (m: Mood) => void;
};

const MoodContext = createContext<MoodState | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState<Mood>("sun");

  useEffect(() => {
    document.documentElement.dataset.mood = mood;
  }, [mood]);

  const value = useMemo(() => ({ mood, setMood }), [mood]);

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
}

