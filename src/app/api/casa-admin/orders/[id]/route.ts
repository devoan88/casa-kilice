import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { deductInventoryForDeliveredOrderIfNeeded } from "@/lib/orderInventory";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.string().min(1).max(120).optional(),
  customerFullName: z.string().max(200).nullable().optional(),
  customerPhone: z.string().max(80).nullable().optional(),
  customerEmail: z.string().max(200).nullable().optional(),
  deliveryAddress: z.string().max(8000).nullable().optional(),
  deliveryZone: z.string().max(200).nullable().optional(),
  paymentMethod: z.enum(["cod", "bank_transfer"]).nullable().optional(),
  productName: z.string().max(500).optional(),
  currency: z.string().max(10).optional(),
  priceCents: z.coerce.number().int().min(0).optional(),
  totalCents: z.coerce.number().int().min(0).nullable().optional(),
  subtotalCents: z.coerce.number().int().min(0).nullable().optional(),
  shippingCents: z.coerce.number().int().min(0).nullable().optional(),
  discountCents: z.coerce.number().int().min(0).nullable().optional(),
  discountDescription: z.string().max(500).nullable().optional(),
  lineItemsJson: z.string().max(20000).nullable().optional(),
  orderKind: z.string().max(120).nullable().optional(),
  stripeSessionId: z.string().max(200).nullable().optional(),
  productId: z.string().max(120).nullable().optional(),
  manualPublicToken: z.string().max(200).nullable().optional(),
  createdAt: z.string().max(40).optional(),
  userId: z.string().max(120).nullable().optional(),
  orderNumber: z.string().trim().max(40).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false as const, error: "Missing id." }, { status: 400 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  const d = parsed.data;
  if (d.lineItemsJson != null && d.lineItemsJson.trim() !== "") {
    try {
      const j = JSON.parse(d.lineItemsJson) as unknown;
      if (!Array.isArray(j)) {
        return NextResponse.json({ ok: false as const, error: "lineItemsJson must be a JSON array." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ ok: false as const, error: "lineItemsJson is not valid JSON." }, { status: 400 });
    }
  }

  const exists = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ ok: false as const, error: "Order not found." }, { status: 404 });
  }

  const data: {
    status?: string;
    customerFullName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    deliveryAddress?: string | null;
    deliveryZone?: string | null;
    paymentMethod?: string | null;
    productName?: string;
    currency?: string;
    priceCents?: number;
    totalCents?: number | null;
    subtotalCents?: number | null;
    shippingCents?: number | null;
    discountCents?: number | null;
    discountDescription?: string | null;
    lineItemsJson?: string | null;
    orderKind?: string | null;
    stripeSessionId?: string | null;
    productId?: string | null;
    manualPublicToken?: string | null;
    createdAt?: Date;
    userId?: string | null;
    orderNumber?: string | null;
  } = {};

  if (d.status !== undefined) data.status = d.status;
  if (d.customerFullName !== undefined) data.customerFullName = d.customerFullName;
  if (d.customerPhone !== undefined) data.customerPhone = d.customerPhone;
  if (d.customerEmail !== undefined) data.customerEmail = d.customerEmail;
  if (d.deliveryAddress !== undefined) data.deliveryAddress = d.deliveryAddress;
  if (d.deliveryZone !== undefined) data.deliveryZone = d.deliveryZone;
  if (d.paymentMethod !== undefined) data.paymentMethod = d.paymentMethod;
  if (d.productName !== undefined) data.productName = d.productName;
  if (d.currency !== undefined) data.currency = d.currency;
  if (d.priceCents !== undefined) data.priceCents = d.priceCents;
  if (d.totalCents !== undefined) data.totalCents = d.totalCents;
  if (d.subtotalCents !== undefined) data.subtotalCents = d.subtotalCents;
  if (d.shippingCents !== undefined) data.shippingCents = d.shippingCents;
  if (d.discountCents !== undefined) data.discountCents = d.discountCents;
  if (d.discountDescription !== undefined) data.discountDescription = d.discountDescription;
  if (d.lineItemsJson !== undefined) data.lineItemsJson = d.lineItemsJson;
  if (d.orderKind !== undefined) data.orderKind = d.orderKind;
  if (d.stripeSessionId !== undefined) data.stripeSessionId = d.stripeSessionId;
  if (d.productId !== undefined) data.productId = d.productId;
  if (d.manualPublicToken !== undefined) data.manualPublicToken = d.manualPublicToken;
  if (d.createdAt !== undefined) {
    const dt = new Date(d.createdAt);
    if (Number.isNaN(dt.getTime())) {
      return NextResponse.json({ ok: false as const, error: "Invalid createdAt." }, { status: 400 });
    }
    data.createdAt = dt;
  }
  if (d.userId !== undefined) data.userId = d.userId;
  if (d.orderNumber !== undefined) {
    if (d.orderNumber === null) {
      data.orderNumber = null;
    } else {
      const t = d.orderNumber.trim();
      data.orderNumber = t === "" ? null : t;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false as const, error: "No changes." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data });
    if (data.status === "Delivered") {
      await deductInventoryForDeliveredOrderIfNeeded(tx, id);
    }
  });

  revalidatePath("/casa-admin/orders");
  revalidatePath("/casa-admin");
  revalidatePath("/casa-admin/products");
  revalidatePath("/shop");

  return NextResponse.json({ ok: true as const });
}

