export const MUSE_REWARD_MAX_POINTS = 1000;

export type MuseMilestone = {
  at: number;
  shortTitle: string;
  detail: string;
};

export const MUSE_MILESTONES: MuseMilestone[] = [
  { at: 100, shortTitle: "15% discount", detail: "Unlock a 15% discount on eligible Casa Kilicé pieces." },
  { at: 500, shortTitle: "Birthday gift box", detail: "Curated birthday gift from the maison." },
  {
    at: 1000,
    shortTitle: "Lifetime Gold",
    detail: "10% off plus complimentary shipping on qualifying orders — steward status for life.",
  },
];

export type MuseTierProgress = {
  /** Progress 0–100 along the 0→1000 axis for the main bar. */
  axisPct: number;
  pointsUntilNext: number;
  nextTitle: string;
  nextAt: number;
  allUnlocked: boolean;
};

export function computeMuseTierProgress(points: number): MuseTierProgress {
  const p = Math.max(0, Math.floor(points));
  const next = MUSE_MILESTONES.find((m) => p < m.at);
  if (!next) {
    return {
      axisPct: 100,
      pointsUntilNext: 0,
      nextTitle: MUSE_MILESTONES[MUSE_MILESTONES.length - 1]!.shortTitle,
      nextAt: MUSE_REWARD_MAX_POINTS,
      allUnlocked: true,
    };
  }
  const axisPct = Math.min(100, (p / MUSE_REWARD_MAX_POINTS) * 100);
  return {
    axisPct,
    pointsUntilNext: next.at - p,
    nextTitle: next.shortTitle,
    nextAt: next.at,
    allUnlocked: false,
  };
}

export function milestoneReached(points: number, at: number): boolean {
  return Math.floor(Math.max(0, points)) >= at;
}
