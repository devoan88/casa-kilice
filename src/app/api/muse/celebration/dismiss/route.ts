import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false as const, error: "Unauthorized." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { musePendingCelebration: null },
  });

  return NextResponse.json({ ok: true as const });
}
