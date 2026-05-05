import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (adminEmail && session.user.email.toLowerCase() !== adminEmail) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const visits = await prisma.visit.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ ok: true, visits });
}

