import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  done: z.boolean().optional(),
  body: z.string().trim().min(1).max(500).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  const data: { done?: boolean; body?: string } = {};
  if (parsed.data.done !== undefined) data.done = parsed.data.done;
  if (parsed.data.body !== undefined) data.body = parsed.data.body;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false as const, error: "No changes." }, { status: 400 });
  }

  try {
    const todo = await prisma.adminTodo.update({ where: { id }, data });
    revalidatePath("/casa-admin");
    return NextResponse.json({ ok: true as const, todo });
  } catch {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  try {
    await prisma.adminTodo.delete({ where: { id } });
    revalidatePath("/casa-admin");
    return NextResponse.json({ ok: true as const });
  } catch {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }
}
