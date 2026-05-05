import { Sparkles } from "lucide-react";

function hintToTitleBody(raw: string): { title: string; body: string } {
  const cleaned = raw.replace(/\*\*/g, "").trim();
  const dot = cleaned.search(/[.!?]\s/);
  if (dot > 24 && dot < 140) {
    return { title: cleaned.slice(0, dot + 1).trim(), body: cleaned.slice(dot + 1).trim() };
  }
  if (cleaned.length > 100) {
    return { title: cleaned.slice(0, 72).trim() + "…", body: cleaned.slice(72).trim() };
  }
  return { title: "Ritual note", body: cleaned };
}

export function RoutineStepCards({
  hints,
  variant,
}: {
  hints: string[];
  variant: "light" | "dark";
}) {
  if (!hints.length) return null;
  const card =
    variant === "dark"
      ? "border-[color:color-mix(in_srgb,var(--espresso)_28%,transparent)] bg-[color:color-mix(in_srgb,#0c0a09_92%,transparent)]"
      : "border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_92%,transparent)]";

  return (
    <div>
      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.26em] text-muted">Step-by-step ritual</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {hints.slice(0, 6).map((raw, i) => {
          const { title, body } = hintToTitleBody(raw);
          return (
            <div key={i} className={`flex gap-3 rounded-[18px] border p-4 ${card}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--hermes)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--hermes)_12%,transparent)] text-[color:var(--hermes)]">
                <Sparkles size={16} strokeWidth={1.35} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--hermes)]">Step {i + 1}</p>
                <p className="mt-1 text-sm font-medium leading-snug text-foreground">{title}</p>
                {body ? <p className="mt-2 text-xs leading-relaxed text-muted">{body}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
