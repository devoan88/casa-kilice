import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { formatMoney } from "@/lib/money";
import { formatPublicOrderNumber } from "@/lib/orderPublicNumber";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function wrapLine(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxLen) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > maxLen ? w.slice(0, maxLen) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 48;
  let y = height - 56;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.18, 0.14, 0.12);
  const muted = rgb(0.42, 0.38, 0.35);

  page.drawText("Casa Kilicé", { x: margin, y, size: 22, font: bold, color: dark });
  page.drawText("INVOICE", { x: width - margin - 72, y, size: 12, font: bold, color: dark });
  y -= 36;

  const ref = formatPublicOrderNumber(order.orderNumber) ?? order.id;
  const totalCents = order.totalCents ?? order.priceCents;
  const totalLabel = formatMoney(totalCents, order.currency);

  const blocks: [string, string][] = [
    ["Order reference", ref],
    ["Date (UTC)", order.createdAt.toISOString().slice(0, 10)],
    ["Status", order.status],
    ["Customer", order.customerFullName ?? "—"],
    ["Phone", order.customerPhone ?? "—"],
    ["Email", order.customerEmail ?? "—"],
    ["Address", order.deliveryAddress ?? "—"],
    [
      "Payment",
      order.paymentMethod === "bank_transfer"
        ? "Bank transfer"
        : order.paymentMethod === "cod"
          ? "Cash on delivery"
          : order.paymentMethod ?? "—",
    ],
  ];

  for (const [label, value] of blocks) {
    if (y < 140) break;
    page.drawText(label, { x: margin, y, size: 9, font: bold, color: muted });
    y -= 12;
    for (const line of wrapLine(value, 72)) {
      if (y < 120) break;
      page.drawText(line, { x: margin, y, size: 10, font, color: dark });
      y -= 12;
    }
    y -= 6;
  }

  y = Math.min(y, 360);
  page.drawText("Line items", { x: margin, y, size: 11, font: bold, color: dark });
  y -= 16;

  let lines: { name: string; qty: number; lineTotalCents: number }[] = [];
  try {
    const j = JSON.parse(order.lineItemsJson || "[]") as unknown;
    if (Array.isArray(j)) {
      lines = j.filter(
        (row): row is { name: string; qty: number; lineTotalCents: number } =>
          row != null &&
          typeof row === "object" &&
          typeof (row as { name?: unknown }).name === "string" &&
          typeof (row as { qty?: unknown }).qty === "number" &&
          typeof (row as { lineTotalCents?: unknown }).lineTotalCents === "number",
      );
    }
  } catch {
    lines = [];
  }

  if (lines.length === 0) {
    if (y > 100) {
      page.drawText(order.productName, { x: margin, y, size: 10, font, color: dark });
      y -= 14;
      page.drawText(`1 × ${totalLabel}`, { x: margin, y, size: 10, font, color: dark });
      y -= 20;
    }
  } else {
    for (const l of lines) {
      if (y < 100) break;
      const row = `${l.name} × ${l.qty} — ${formatMoney(l.lineTotalCents, order.currency)}`;
      for (const part of wrapLine(row, 80)) {
        if (y < 80) break;
        page.drawText(part, { x: margin, y, size: 10, font, color: dark });
        y -= 12;
      }
    }
  }

  y = 120;
  page.drawText("Total", { x: margin, y, size: 12, font: bold, color: dark });
  page.drawText(totalLabel, { x: width - margin - 120, y, size: 14, font: bold, color: dark });
  y -= 22;
  page.drawText("Catalogue single-SKU reference: 65 GEL where applicable.", {
    x: margin,
    y,
    size: 9,
    font,
    color: muted,
  });
  y -= 14;
  page.drawText("Thank you for shopping with Casa Kilicé.", { x: margin, y, size: 9, font, color: muted });

  const bytes = await pdf.save();
  const filename = `invoice-${ref.replace(/#/g, "").replace(/\s/g, "-")}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
