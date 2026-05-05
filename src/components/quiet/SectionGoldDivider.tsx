/** Thin gold rule with centered ornament â€” use between major home sections. */
export function SectionGoldDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "mx-auto flex w-full max-w-6xl items-center gap-5 px-5 py-10 md:py-12",
        className,
      ].join(" ")}
      role="presentation"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[color:rgba(243,229,171,0.55)] to-[color:rgba(243,229,171,0.85)]" />
      <div className="flex flex-col items-center gap-1 text-[color:var(--gold)]">
        <span
          className="block h-2 w-2 rotate-45 border border-[color:rgba(243,229,171,0.85)] bg-[color:rgba(243,229,171,0.12)]"
          aria-hidden
        />
        <span className="font-[family-name:var(--font-display)] text-[11px] italic leading-none opacity-80">
          âœ¦
        </span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[color:rgba(243,229,171,0.55)] to-[color:rgba(243,229,171,0.85)]" />
    </div>
  );
}
