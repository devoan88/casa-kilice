import { Suspense } from "react";

import { CasaAdminManualOrderPanel } from "@/components/casa-admin/CasaAdminManualOrderPanel";
import { CasaAdminOrdersLiveRefresh } from "@/components/casa-admin/CasaAdminOrdersLiveRefresh";
import { CasaAdminOrdersTable, type CasaAdminOrderRow } from "@/components/casa-admin/CasaAdminOrdersTable";
import { CasaAdminOrdersToolbar } from "@/components/casa-admin/CasaAdminOrdersToolbar";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CasaAdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireCasaAdmin();
  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  const where =
    q.length > 0
      ? {
          OR: [
            { orderNumber: { contains: q } },
            { customerFullName: { contains: q } },
            { customerPhone: { contains: q } },
            { customerEmail: { contains: q } },
          ],
        }
      : undefined;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      orderNumber: true,
      userId: true,
      createdAt: true,
      status: true,
      orderKind: true,
      productId: true,
      productName: true,
      lineItemsJson: true,
      currency: true,
      priceCents: true,
      subtotalCents: true,
      shippingCents: true,
      discountCents: true,
      discountDescription: true,
      totalCents: true,
      customerFullName: true,
      customerPhone: true,
      customerEmail: true,
      deliveryAddress: true,
      deliveryZone: true,
      paymentMethod: true,
      stripeSessionId: true,
      manualPublicToken: true,
    },
  });

  const rows: CasaAdminOrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    userId: o.userId,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    orderKind: o.orderKind,
    productId: o.productId,
    productName: o.productName,
    lineItemsJson: o.lineItemsJson,
    currency: o.currency,
    priceCents: o.priceCents,
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    discountCents: o.discountCents,
    discountDescription: o.discountDescription,
    totalCents: o.totalCents,
    customerFullName: o.customerFullName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    deliveryAddress: o.deliveryAddress,
    deliveryZone: o.deliveryZone,
    paymentMethod: o.paymentMethod,
    stripeSessionId: o.stripeSessionId,
    manualPublicToken: o.manualPublicToken,
  }));

  return (
    <div className="space-y-8">
      <CasaAdminOrdersLiveRefresh />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Orders</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Fulfillment pipeline with search. Stock is adjusted automatically when an order is set to{" "}
          <strong>Delivered</strong>.
        </p>
      </div>
      <Suspense fallback={<div className="h-12 animate-pulse rounded-lg bg-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)]" />}>
        <CasaAdminOrdersToolbar />
      </Suspense>
      <CasaAdminManualOrderPanel />
      <CasaAdminOrdersTable orders={rows} />
    </div>
  );
}
