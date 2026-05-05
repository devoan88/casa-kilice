import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { deductInventoryForDeliveredOrderIfNeeded } from "@/lib/orderInventory";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["Pending", "Paid", "Shipped", "Delivered", "Cancelled"]);

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = z.object({ status: statusSchema }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid status." }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false as const, error: "Order not found." }, { status: 404 });
  }

  const nextStatus = parsed.data.status;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: nextStatus },
    });
    if (nextStatus === "Delivered") {
      await deductInventoryForDeliveredOrderIfNeeded(tx, id);
    }
  });

  revalidatePath("/casa-admin");
  revalidatePath("/casa-admin/orders");
  revalidatePath("/casa-admin/products");
  revalidatePath("/shop");

  return NextResponse.json({ ok: true as const });
}
