import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { formatMoney } from "@/lib/money";
import { formatPublicOrderNumber } from "@/lib/orderPublicNumber";
import { prisma } from "@/lib/prisma";

function csvEscape(s: string) {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10_000,
    select: {
      orderNumber: true,
      createdAt: true,
      status: true,
      customerFullName: true,
      customerPhone: true,
      customerEmail: true,
      paymentMethod: true,
      currency: true,
      totalCents: true,
      priceCents: true,
      productName: true,
    },
  });

  const header = [
    "order_ref",
    "created_at",
    "status",
    "customer_name",
    "phone",
    "email",
    "payment_method",
    "currency",
    "total",
    "summary",
  ];

  const rows = orders.map((o) => {
    const ref = formatPublicOrderNumber(o.orderNumber) ?? o.orderNumber ?? "";
    const total = o.totalCents ?? o.priceCents;
    const pay = o.paymentMethod === "bank_transfer" ? "bank_transfer" : o.paymentMethod === "cod" ? "cod" : o.paymentMethod ?? "";
    return [
      ref,
      o.createdAt.toISOString(),
      o.status,
      o.customerFullName ?? "",
      o.customerPhone ?? "",
      o.customerEmail ?? "",
      pay,
      o.currency,
      formatMoney(total, o.currency),
      o.productName,
    ]
      .map((c) => csvEscape(String(c)))
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="casa-kilice-sales-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
