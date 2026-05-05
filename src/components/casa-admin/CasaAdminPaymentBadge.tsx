"use client";

export function CasaAdminPaymentBadge({ method }: { method: string | null }) {
  if (!method) {
    return <span className="text-[10px] text-muted">—</span>;
  }
  const isBank = method === "bank_transfer";
  const label = isBank ? "Bank transfer" : method === "cod" ? "Cash" : method;
  const cls = isBank
    ? "border-sky-400/70 bg-sky-50 text-sky-950"
    : method === "cod"
      ? "border-emerald-400/70 bg-emerald-50 text-emerald-950"
      : "border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--sand-soft)] text-[color:var(--espresso)]";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        cls,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
