import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type MembershipTier = "SILK" | "GOLD" | "VELVET";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [ritual, orderCount, orders] = await Promise.all([
    prisma.ritualStreak.findUnique({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true,
        productName: true,
        createdAt: true,
        status: true,
      },
    }),
  ]);

  const streak = ritual?.streak ?? 0;
  const score = clamp(streak * 3.5, 0, 70) + clamp(orderCount * 10, 0, 30);
  const percent = Math.round(clamp(score, 0, 100));

  let tier: MembershipTier = "SILK";
  if (percent >= 85) tier = "VELVET";
  else if (percent >= 55) tier = "GOLD";

  const nextTier: MembershipTier | null =
    tier === "SILK" ? "GOLD" : tier === "GOLD" ? "VELVET" : null;

  return NextResponse.json({
    tier,
    percent,
    nextTier,
    streak,
    orders: orderCount,
    name: user.name ?? session.user?.name ?? null,
    email: user.email,
    purchases: orders,
  });
}
