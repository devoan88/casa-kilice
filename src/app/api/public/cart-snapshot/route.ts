import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(300),
  price: z.number().finite().nonnegative(),
  imageSrc: z.string().max(500),
  qty: z.number().int().min(1).max(99),
});

const bodySchema = z.object({
  clientKey: z.string().min(8).max(128),
  items: z.array(itemSchema).max(40),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid payload." }, { status: 400 });
  }

  const { clientKey, items } = parsed.data;
  if (items.length === 0) {
    await prisma.abandonedCart.deleteMany({ where: { clientKey } }).catch(() => null);
    return NextResponse.json({ ok: true as const });
  }

  await prisma.abandonedCart.upsert({
    where: { clientKey },
    create: {
      clientKey,
      itemsJson: JSON.stringify(items),
    },
    update: {
      itemsJson: JSON.stringify(items),
    },
  });

  return NextResponse.json({ ok: true as const });
}
