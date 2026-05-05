import { useI18n } from "@/i18n/LanguageProvider";
import type { WellnessProtocol } from "@/lib/skinScan/types";

function snack(s: string, maxLen = 220): string {
  const txt = s.trim();
  if (txt.length <= maxLen) return txt;
  const cut = txt.slice(0, maxLen);
  const sp = cut.lastIndexOf(" ");
  return (sp > 40 ? cut.slice(0, sp) : cut).trim() + "…";
}

export function WellnessInfographicCards({
  wellness,
  variant,
}: {
  wellness: WellnessProtocol;
  variant: "light" | "dark";
}) {
  const { t } = useI18n();
  const card =
    variant === "dark"
      ? "border-[color:color-mix(in_srgb,var(--espresso)_28%,transparent)] bg-[color:color-mix(in_srgb,#0c0a09_94%,transparent)]"
      : "border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_95%,transparent)]";

  const items = [
    {
      icon: "💧",
      title: "Hydration",
      body: snack(`${wellness.signals.hydration} ${wellness.texture.summary}`),
    },
    {
      icon: "💊",
      title: "Vitamins & plate",
      body: snack(
        `${wellness.supplements.suggestions.slice(0, 3).join(" · ")}. ${wellness.supplements.note}`,
      ),
    },
    {
      icon: "🌙",
      title: "Sleep & movement",
      body: snack(`${wellness.lifestyle.sleepHours} · ${wellness.lifestyle.exercise}`),
    },
    {
      icon: "☀️",
      title: "SPF & sun",
      body: snack(`${wellness.sunSafety.spfGuidance} ${wellness.sunSafety.tanningAdvice}`),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.26em] text-muted">
        {t("skin_scan_wellness_snapshot_kicker")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.title}
            className={`rounded-[20px] border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.12)] ${card}`}
          >
            <p className="text-2xl" aria-hidden>
              {it.icon}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--hermes)]">{it.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
