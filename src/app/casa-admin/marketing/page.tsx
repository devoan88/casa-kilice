import { CasaAdminMarketingForm } from "@/components/casa-admin/CasaAdminMarketingForm";
import { CasaAdminPromoCouponsPanel } from "@/components/casa-admin/CasaAdminPromoCouponsPanel";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";

export default async function CasaAdminMarketingPage() {
  await requireCasaAdmin();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Marketing</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Promo codes for campaigns, plus broadcast email when Resend is configured.
        </p>
      </div>

      <CasaAdminPromoCouponsPanel />

      <div className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">Email broadcast</h2>
        <p className="max-w-2xl text-sm text-muted">
          Send newsletter or new-product updates via Resend. Configure <code className="text-[color:var(--espresso)]">RESEND_API_KEY</code>{" "}
          and a verified <code className="text-[color:var(--espresso)]">EMAIL_FROM</code> domain in production.
        </p>
        <CasaAdminMarketingForm />
      </div>
    </div>
  );
}
