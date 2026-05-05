import Link from "next/link";
import { redirect } from "next/navigation";

import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { formatMoney } from "@/lib/money";
import { formatPublicOrderNumber } from "@/lib/orderPublicNumber";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  // Secure: same auth rules as /casa-admin (role=ADMIN or ADMIN_EMAIL allowlist)
  await requireCasaAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.28em] uppercase text-muted">Admin</p>
          <h1 className="mt-1 text-3xl tracking-tight md:text-4xl">Manual orders</h1>
          <p className="mt-2 max-w-prose text-muted">
            Pending verification — call the customer to confirm, then update status in your ops workflow.
          </p>
        </div>
        <Link href="/admin/visitors" className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline">
          Visitor map →
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-[28px] border border-border bg-surface p-4 md:p-6">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              <th className="py-3 pr-4">Id</th>
              <th className="py-3 pr-4">Order #</th>
              <th className="py-3 pr-4">When</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Phone</th>
              <th className="py-3 pr-4">Account</th>
              <th className="py-3 pr-4">Pay</th>
              <th className="py-3 pr-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-border/80 align-top last:border-0">
                  <td className="py-4 pr-4 font-mono text-[10px] text-muted break-all max-w-[100px]">{o.id}</td>
                  <td className="py-4 pr-4 font-mono text-xs font-medium text-foreground">
                    {formatPublicOrderNumber(o.orderNumber) ?? "—"}
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap text-muted">
                    {o.createdAt.toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-4 pr-4 font-medium">{o.status}</td>
                  <td className="py-4 pr-4">
                    <div className="max-w-[180px] font-medium">{o.customerFullName ?? "—"}</div>
                    <div className="mt-2 max-w-[280px] whitespace-pre-wrap text-xs leading-snug text-muted">
                      {o.deliveryAddress ?? "—"}
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs">{o.customerPhone ?? "—"}</td>
                  <td className="py-4 pr-4 text-xs text-muted">
                    {o.user?.email ?? o.customerEmail ?? "—"}
                    {o.user?.name ? (
                      <>
                        <br />
                        <span className="text-foreground/80">{o.user.name}</span>
                      </>
                    ) : null}
                  </td>
                  <td className="py-4 pr-4 text-xs tracking-wide">
                    {o.paymentMethod === "bank_transfer"
                      ? "Payment method: Bank transfer"
                      : o.paymentMethod === "cod"
                        ? "Payment method: Cash"
                        : o.paymentMethod ?? "—"}
                  </td>
                  <td className="py-4 pl-4 text-right tabular-nums font-medium">
                    {o.totalCents != null ? formatMoney(o.totalCents, o.currency) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-muted">
        Ask customers to reference their order number (#CK-…) or full id on bank transfers.
      </p>
    </div>
  );
}
