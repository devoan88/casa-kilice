import { MEDICAL_DISCLAIMER_EN, MEDICAL_DISCLAIMER_KA } from "@/lib/skinScan/wellnessProtocol";

export function MedicalDisclaimerStrip({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-[18px] border border-[color:color-mix(in_srgb,var(--hermes)_22%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_55%,transparent)] p-4 text-left text-xs leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_78%,#333)] ${className}`}
      role="note"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Medical disclaimer</p>
      <p className="mt-2 font-[family-name:var(--font-georgian)] text-[13px] text-foreground">{MEDICAL_DISCLAIMER_KA}</p>
      <p className="mt-2 text-muted">{MEDICAL_DISCLAIMER_EN}</p>
    </aside>
  );
}
