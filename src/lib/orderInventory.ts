import type { Prisma } from "@/generated/prisma";

type LineItem = { slug?: unknown; qty?: unknown };

function parseLineItems(json: string | null): { slug: string; qty: number }[] {
  if (!json?.trim()) return [];
  try {
    const arr = JSON.parse(json) as unknown;
    if (!Array.isArray(arr)) return [];
    const out: { slug: string; qty: number }[] = [];
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      const slug = (row as LineItem).slug;
      const qty = (row as LineItem).qty;
      if (typeof slug !== "string" || !slug.trim()) continue;
      const q = typeof qty === "number" && Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
      out.push({ slug: slug.trim(), qty: q });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * When an order is Delivered, subtract line quantities from product stock once.
 */
export async function deductInventoryForDeliveredOrderIfNeeded(
  tx: Prisma.TransactionClient,
  orderId: string,
): Promise<void> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      inventoryDeducted: true,
      lineItemsJson: true,
      status: true,
      productId: true,
    },
  });
  if (!order || order.inventoryDeducted || order.status !== "Delivered") return;

  const lines = parseLineItems(order.lineItemsJson);
  if (lines.length > 0) {
    for (const line of lines) {
      const product = await tx.product.findUnique({
        where: { slug: line.slug },
        select: { id: true, stock: true },
      });
      if (!product) continue;
      const next = Math.max(0, product.stock - line.qty);
      await tx.product.update({
        where: { id: product.id },
        data: { stock: next },
      });
    }
  } else if (order.productId) {
    const product = await tx.product.findUnique({
      where: { id: order.productId },
      select: { id: true, stock: true },
    });
    if (product) {
      await tx.product.update({
        where: { id: product.id },
        data: { stock: Math.max(0, product.stock - 1) },
      });
    }
  }

  await tx.order.update({
    where: { id: orderId },
    data: { inventoryDeducted: true },
  });
}
