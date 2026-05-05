import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { isPendingPaymentWatchdogStatus, isStalePendingOrder } from "@/lib/casaAdminFinance";
import { sendPaymentReminderEmail } from "@/lib/mail";
import { formatPublicOrderNumber } from "@/lib/orderPublicNumber";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      customerEmail: true,
      customerFullName: true,
      totalCents: true,
      priceCents: true,
      currency: true,
      paymentMethod: true,
      orderNumber: true,
    },
  });

  if (!order) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  const email = order.customerEmail?.trim();
  if (!email) {
    return NextResponse.json({ ok: false as const, error: "Order has no customer email." }, { status: 400 });
  }

  if (!isPendingPaymentWatchdogStatus(order.status)) {
    return NextResponse.json({ ok: false as const, error: "Order is not in a pending payment state." }, { status: 400 });
  }

  if (!isStalePendingOrder(order.createdAt, order.status)) {
    return NextResponse.json({ ok: false as const, error: "Reminder is only available after 24 hours in pending state." }, { status: 400 });
  }

  const orderLabel = formatPublicOrderNumber(order.orderNumber) ?? `#${order.id.slice(0, 8)}`;
  const totalCents = order.totalCents ?? order.priceCents;

  const sent = await sendPaymentReminderEmail({
    to: email,
    customerName: order.customerFullName?.trim() || "Customer",
    orderLabel,
    totalCents,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
  });

  if (!sent.ok) {
    return NextResponse.json(
      { ok: false as const, error: sent.error ?? "Could not send email.", skipped: sent.skipped },
      { status: sent.skipped ? 503 : 502 },
    );
  }

  return NextResponse.json({ ok: true as const });
}
