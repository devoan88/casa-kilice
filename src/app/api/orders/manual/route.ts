import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { persistManualCheckoutOrder } from "@/lib/manualOrderPersist";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  items: z.array(z.object({ slug: z.string().min(1).max(120), qty: z.number().int().min(1).max(99) })).min(1).max(30),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(200),
  address: z.string().trim().min(10).max(4000),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  promoCode: z.string().trim().max(40).optional().nullable(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid order data." }, { status: 400 });
  }

  const { fullName, phone, email, address, paymentMethod } = parsed.data;
  const items = parsed.data.items;

  const session = await getServerSession(authOptions);
  const userId =
    session?.user?.id != null
      ? (
          await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true },
          })
        )?.id ?? null
      : null;

  const result = await persistManualCheckoutOrder({
    items,
    fullName,
    phone,
    email,
    address,
    paymentMethod,
    userId,
    musePercentOff: 0,
    applyMuseDiscount: false,
    orderKind: "manual",
    promoCode: parsed.data.promoCode ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false as const, error: result.error }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const completeUrl = `${baseUrl}/checkout/complete?token=${encodeURIComponent(result.token)}`;

  void sendOrderConfirmationEmail({
    to: email,
    orderId: result.order.id,
    customerName: fullName,
    lines: result.lines.map((l) => ({ name: l.name, qty: l.qty, lineTotalCents: l.lineTotalCents })),
    totalCents: result.order.totalCents ?? 0,
    currency: result.order.currency,
    paymentMethod: paymentMethod,
    completeUrl,
  });

  revalidatePath("/casa-admin");
  revalidatePath("/casa-admin/orders");
  revalidatePath("/casa-admin/creators");

  return NextResponse.json({
    ok: true as const,
    token: result.token,
    orderId: result.order.id,
    orderNumber: result.order.orderNumber,
    paymentMethod,
  });
}
