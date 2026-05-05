import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { persistManualCheckoutOrder } from "@/lib/manualOrderPersist";

const bodySchema = z.object({
  items: z.array(z.object({ slug: z.string().min(1).max(120), qty: z.number().int().min(1).max(99) })).min(1).max(30),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(200),
  address: z.string().trim().min(10).max(4000),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  sendConfirmationEmail: z.boolean().optional(),
  promoCode: z.string().trim().max(40).optional().nullable(),
});

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid order data." }, { status: 400 });
  }

  const d = parsed.data;
  const result = await persistManualCheckoutOrder({
    items: d.items,
    fullName: d.fullName,
    phone: d.phone,
    email: d.email,
    address: d.address,
    paymentMethod: d.paymentMethod,
    userId: null,
    musePercentOff: 0,
    applyMuseDiscount: false,
    orderKind: "manual_instagram",
    promoCode: d.promoCode ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false as const, error: result.error }, { status: 400 });
  }

  const sendMail = d.sendConfirmationEmail !== false;
  if (sendMail) {
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const completeUrl = `${baseUrl}/checkout/complete?token=${encodeURIComponent(result.token)}`;
    void sendOrderConfirmationEmail({
      to: d.email,
      orderId: result.order.id,
      customerName: d.fullName,
      lines: result.lines.map((l) => ({ name: l.name, qty: l.qty, lineTotalCents: l.lineTotalCents })),
      totalCents: result.order.totalCents ?? 0,
      currency: result.order.currency,
      paymentMethod: d.paymentMethod,
      completeUrl,
    });
  }

  revalidatePath("/casa-admin");
  revalidatePath("/casa-admin/orders");
  revalidatePath("/casa-admin/creators");

  return NextResponse.json({
    ok: true as const,
    orderId: result.order.id,
    orderNumber: result.order.orderNumber,
    token: result.token,
  });
}
