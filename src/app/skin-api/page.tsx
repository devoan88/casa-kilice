import { SkinApiLanding } from "@/components/skin-api/SkinApiLanding";
import { saasCreditPriceCents } from "@/lib/saas/creditCost";
import { saasBasicMonthlyScanCap } from "@/lib/saas/subscriptionTiers";

export const dynamic = "force-dynamic";

export default function SkinApiPage() {
  const priceTetri = saasCreditPriceCents();
  const basicMonthlyScans = saasBasicMonthlyScanCap();
  const bankIban = process.env.CK_BANK_IBAN?.trim() ?? "";
  const bankName = process.env.CK_BANK_NAME?.trim() ?? "";
  return (
    <SkinApiLanding
      priceTetri={priceTetri}
      basicMonthlyScans={basicMonthlyScans}
      bankIban={bankIban}
      bankName={bankName}
    />
  );
}
