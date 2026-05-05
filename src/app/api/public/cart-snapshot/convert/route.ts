import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  clientKey: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid payload." }, { status: 400 });
  }

  const { clientKey } = parsed.data;
  await prisma.abandonedCart.updateMany({
    where: { clientKey, convertedAt: null },
    data: { convertedAt: new Date() },
  });

  return NextResponse.json({ ok: true as const });
}
