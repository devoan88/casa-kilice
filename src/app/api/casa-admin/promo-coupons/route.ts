import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  code: z.string().trim().min(2).max(40),
  percentOff: z.coerce.number().int().min(1).max(100),
  expiresAt: z.string().min(8).max(40),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const coupons = await prisma.promoCoupon.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ ok: true as const, coupons });
}

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid coupon." }, { status: 400 });
  }

  const code = parsed.data.code.toUpperCase();
  const exp = new Date(parsed.data.expiresAt);
  if (Number.isNaN(exp.getTime())) {
    return NextResponse.json({ ok: false as const, error: "Invalid expiration date." }, { status: 400 });
  }

  try {
    const coupon = await prisma.promoCoupon.create({
      data: {
        code,
        percentOff: parsed.data.percentOff,
        expiresAt: exp,
        isActive: true,
      },
    });
    revalidatePath("/casa-admin/marketing");
    return NextResponse.json({ ok: true as const, coupon });
  } catch {
    return NextResponse.json({ ok: false as const, error: "Code already exists." }, { status: 409 });
  }
}
