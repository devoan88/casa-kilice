import Link from "next/link";

import { prisma } from "@/lib/prisma";
import type { ConsultationAnalysisPayload, GenderPresentation } from "@/lib/skinScan/types";

export const dynamic = "force-dynamic";

function bump(map: Map<string, number>, key: string) {
  const k = key.trim() || "—";
  map.set(k, (map.get(k) ?? 0) + 1);
}

function sortedBars(map: Map<string, number>, limit = 12) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default async function SkinScanInsightsPage() {
  const rows = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 600,
    select: { analysisResult: true },
  });

  const undertones = new Map<string, number>();
  const depths = new Map<string, number>();
  const sources = new Map<string, number>();
  const gender = new Map<string, number>();
  const seasons = new Map<string, number>();
  let parsedOk = 0;

  for (const r of rows) {
    try {
      const a = JSON.parse(r.analysisResult) as Partial<ConsultationAnalysisPayload>;
      parsedOk += 1;
      if (typeof a.undertone === "string") bump(undertones, a.undertone);
      if (typeof a.depth === "string") bump(depths, a.depth);
      if (typeof a.analysisSource === "string") bump(sources, a.analysisSource);
      const gp = a.styling?.genderPresentation as GenderPresentation | undefined;
      if (gp === "female" || gp === "male" || gp === "unknown") bump(gender, gp);
      const cs = a.styling?.colorSeason;
      if (typeof cs === "string" && cs.length > 0) bump(seasons, cs);
    } catch {
      /* skip malformed */
    }
  }

  const Bar = ({ label, count, max }: { label: string; count: number; max: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-xs">
        <span className="min-w-0 truncate font-medium text-[color:var(--espresso)]">{label}</span>
        <span className="shrink-0 tabular-nums text-muted">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)]">
        <div
          className="h-full rounded-full bg-[color:color-mix(in_srgb,var(--espresso)_55%,#fff)] transition-[width]"
          style={{ width: `${max > 0 ? Math.round((count / max) * 100) : 0}%` }}
        />
      </div>
    </div>
  );

  const Block = ({
    title,
    entries,
  }: {
    title: string;
    entries: [string, number][];
  }) => {
    const max = entries[0]?.[1] ?? 0;
    return (
      <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--espresso)]">{title}</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No data yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {entries.map(([label, count]) => (
              <Bar key={label} label={label} count={count} max={max} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/casa-admin" className="text-sm text-muted hover:text-[color:var(--espresso)]">
          ← Overview
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[color:var(--espresso)]">
          Skin scan insights
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Aggregated trends from saved consultations (undertone, depth, vision source, gender presentation read, colour
          season). Based on the last {rows.length} records in the database.
        </p>
        <p className="mt-2 text-xs text-muted">
          Parsed successfully: <span className="font-medium text-[color:var(--espresso)]">{parsedOk}</span> of{" "}
          {rows.length}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="Undertone" entries={sortedBars(undertones)} />
        <Block title="Depth" entries={sortedBars(depths)} />
        <Block title="Analysis source" entries={sortedBars(sources)} />
        <Block title="Gender presentation (vision)" entries={sortedBars(gender)} />
      </div>
      <Block title="Colour season (top reads)" entries={sortedBars(seasons, 20)} />
    </div>
  );
}
