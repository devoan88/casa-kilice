import { randomBytes } from "node:crypto";

import type { MuseCelebrationTier, MusePendingCelebrationPayload } from "@/lib/muse/celebrationMessages";
import { prisma } from "@/lib/prisma";

export type { MuseCelebrationTier, MusePendingCelebrationPayload } from "@/lib/muse/celebrationMessages";

const BRONZE_AT = 100;
const GOLD_AT = 500;
const ELITE_AT = 1000;

async function generateUniqueMuse15Code(): Promise<string> {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const code = `MUSE15-${randomBytes(4).toString("hex").toUpperCase()}`;
    const clash = await prisma.user.findFirst({
      where: { museDiscountCode15: code },
      select: { id: true },
    });
    if (!clash) return code;
  }
  throw new Error("[muse] exhausted discount code generation retries");
}

function tierForPoints(points: number): MuseCelebrationTier | null {
  const p = Math.max(0, Math.floor(points));
  if (p >= ELITE_AT) return "Elite";
  if (p >= GOLD_AT) return "Gold";
  if (p >= BRONZE_AT) return "Bronze";
  return null;
}

/**
 * Server-only: run after points increase (registration or approved submission).
 * Updates tier, discount code, birthday / shipping flags, and optional one-shot celebration payload.
 */
export async function applyMuseRewardsAfterPointChange(
  userId: string,
  oldPoints: number,
  newPoints: number,
): Promise<void> {
  const o = Math.max(0, Math.floor(oldPoints));
  const n = Math.max(0, Math.floor(newPoints));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      museDiscountCode15: true,
      museBirthdayBoxFlag: true,
      museFreeShipping: true,
    },
  });
  if (!user) return;

  const crossedBronze = o < BRONZE_AT && n >= BRONZE_AT;
  const crossedGold = o < GOLD_AT && n >= GOLD_AT;
  const crossedElite = o < ELITE_AT && n >= ELITE_AT;

  const tier = tierForPoints(n);
  let museDiscountCode15 = user.museDiscountCode15;
  if (n >= BRONZE_AT && !museDiscountCode15) {
    museDiscountCode15 = await generateUniqueMuse15Code();
  }

  const museBirthdayBoxFlag = user.museBirthdayBoxFlag || n >= GOLD_AT;
  const museFreeShipping = user.museFreeShipping || n >= ELITE_AT;

  let celebration: MusePendingCelebrationPayload | null = null;
  if (crossedElite) {
    celebration = { tier: "Elite", discountCode: museDiscountCode15 ?? undefined };
  } else if (crossedGold) {
    celebration = { tier: "Gold", discountCode: museDiscountCode15 ?? undefined };
  } else if (crossedBronze) {
    celebration = { tier: "Bronze", discountCode: museDiscountCode15 ?? undefined };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      museStatus: tier,
      museDiscountCode15,
      museBirthdayBoxFlag,
      museFreeShipping,
      ...(celebration ? { musePendingCelebration: JSON.stringify(celebration) } : {}),
    },
  });
}
