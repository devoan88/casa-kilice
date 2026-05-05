import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  try {
    await prisma.businessExpense.delete({ where: { id } });
    revalidatePath("/casa-admin/finance");
    return NextResponse.json({ ok: true as const });
  } catch {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }
}
