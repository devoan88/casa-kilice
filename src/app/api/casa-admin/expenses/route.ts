import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { priceCentsFromGel } from "@/lib/products";

const createSchema = z.object({
  label: z.string().trim().min(1).max(200),
  category: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((s) => (s && s.length > 0 ? s : "General")),
  amountGel: z.coerce.number().finite().min(0).max(1_000_000),
  notes: z.string().trim().max(2000).optional(),
  incurredAt: z.string().trim().min(4).max(40).optional(),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const expenses = await prisma.businessExpense.findMany({
    orderBy: { incurredAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ ok: true as const, expenses });
}

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid expense." }, { status: 400 });
  }

  const { label, category, amountGel, notes } = parsed.data;
  let incurredAt = new Date();
  if (parsed.data.incurredAt) {
    const d = new Date(parsed.data.incurredAt);
    if (!Number.isNaN(d.getTime())) incurredAt = d;
  }

  const expense = await prisma.businessExpense.create({
    data: {
      label,
      category,
      amountCents: priceCentsFromGel(amountGel),
      currency: "GEL",
      incurredAt,
      notes: notes?.trim() ? notes.trim() : null,
    },
  });

  revalidatePath("/casa-admin/finance");
  return NextResponse.json({ ok: true as const, expense });
}
