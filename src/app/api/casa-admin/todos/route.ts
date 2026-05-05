import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  body: z.string().trim().min(1).max(500),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const todos = await prisma.adminTodo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ ok: true as const, todos });
}

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid task." }, { status: 400 });
  }

  const maxRow = await prisma.adminTodo.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxRow._max.sortOrder ?? 0) + 1;

  const todo = await prisma.adminTodo.create({
    data: { body: parsed.data.body, sortOrder },
  });

  revalidatePath("/casa-admin");

  return NextResponse.json({ ok: true as const, todo });
}
