import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = todayKey();
  const yesterday = yesterdayKey();

  const existing = await prisma.ritualStreak.findUnique({
    where: { userId: user.id },
  });

  if (existing?.lastDay === now) {
    return NextResponse.json({ streak: existing.streak, lastDay: existing.lastDay });
  }

  const next =
    existing?.lastDay === yesterday
      ? { streak: Math.max(1, (existing?.streak ?? 0) + 1), lastDay: now }
      : { streak: 1, lastDay: now };

  const updated = await prisma.ritualStreak.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...next },
    update: next,
  });

  return NextResponse.json({ streak: updated.streak, lastDay: updated.lastDay });
}

