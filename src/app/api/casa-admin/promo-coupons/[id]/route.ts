import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success || parsed.data.isActive === undefined) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  try {
    const coupon = await prisma.promoCoupon.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
    });
    revalidatePath("/casa-admin/marketing");
    return NextResponse.json({ ok: true as const, coupon });
  } catch {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }
}
