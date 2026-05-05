import Link from "next/link";

import { CasaAdminSaaSPanel } from "@/components/casa-admin/CasaAdminSaaSPanel";

export default function CasaAdminSaaSPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/casa-admin" className="text-sm text-muted hover:text-[color:var(--espresso)]">
          ← Overview
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[color:var(--espresso)]">
          Skin API · SaaS
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Manage B2B partners, API keys, and credit packs. Stripe Checkout tops up credits; use{" "}
          <strong>Manual credits</strong> after a bank transfer to your IBAN. Configure{" "}
          <code className="text-xs">STRIPE_WEBHOOK_SECRET</code> and point Stripe to{" "}
          <code className="text-xs">/api/webhooks/stripe</code>.
        </p>
      </div>
      <CasaAdminSaaSPanel />
    </div>
  );
}
