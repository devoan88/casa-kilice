export const dynamic = "force-static";

export default function MaintenancePage() {
  return (
    <div className="min-h-svh bg-[#050403] px-6 py-16 text-[color:rgba(245,240,234,0.92)]">
      <div className="mx-auto max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[color:rgba(232,196,92,0.8)]">
          Casa Kilicé
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Maintenance in progress
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[color:rgba(245,240,234,0.7)]">
          We’re updating the spatial skin scan and wellness passport. Please check back shortly.
        </p>
        <div className="mt-10 rounded-[28px] border border-[color:rgba(255,255,255,0.08)] bg-[rgba(18,15,12,0.55)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-[50px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:rgba(232,196,92,0.78)]">
            Status
          </p>
          <p className="mt-3 text-sm text-[color:rgba(245,240,234,0.75)]">
            Systems secure · Deploying updates · Back online soon
          </p>
        </div>
      </div>
    </div>
  );
}

