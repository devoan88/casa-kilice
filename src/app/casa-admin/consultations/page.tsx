import Link from "next/link";

import { prisma } from "@/lib/prisma";
import type { ConsultationAnalysisPayload } from "@/lib/skinScan/types";

export const dynamic = "force-dynamic";

export default async function CasaAdminConsultationsPage() {
  const rows = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/casa-admin" className="text-sm text-muted hover:text-[color:var(--espresso)]">
          ← Overview
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[color:var(--espresso)]">
          User consultations
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          AI skin scan outcomes: client photo (when uploaded), vision/heuristic analysis, and the exact Casa Kilicé
          recommendation text saved for each run.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">No consultations yet.</p>
      ) : (
        <ul className="grid list-none gap-8">
          {rows.map((c) => {
            let analysis: Partial<ConsultationAnalysisPayload> = {};
            try {
              analysis = JSON.parse(c.analysisResult) as Partial<ConsultationAnalysisPayload>;
            } catch {
              /* ignore */
            }
            const styling = analysis.styling;
            const wellness = analysis.wellness;
            return (
              <li
                key={c.id}
                className="overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]"
              >
                <div className="grid gap-6 p-6 lg:grid-cols-[220px,1fr]">
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Client photo</p>
                    {c.userPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-only dynamic file route
                      <img
                        src={`/api/casa-admin/consultations/${c.id}/photo`}
                        alt=""
                        className="aspect-[3/4] w-full max-w-[220px] rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] w-full max-w-[220px] items-center justify-center rounded-xl border border-dashed border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_40%,#fff)] text-center text-xs text-muted">
                        No photo
                        <br />
                        (JSON scan)
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="font-medium text-[color:var(--espresso)]">{c.user.email ?? c.userId}</p>
                      <time className="text-xs text-muted" dateTime={c.createdAt.toISOString()}>
                        {c.createdAt.toLocaleString()}
                      </time>
                    </div>
                    <p className="text-xs text-muted">
                      Analysis:{" "}
                      <span className="text-foreground">
                        {analysis.undertone ?? "—"} / {analysis.depth ?? "—"}
                      </span>
                      {analysis.analysisSource ? (
                        <span className="ml-2 rounded-full bg-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          {analysis.analysisSource}
                        </span>
                      ) : null}
                      {c.primaryProductSlug ? (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted">
                          Product: {c.primaryProductSlug}
                        </span>
                      ) : null}
                    </p>
                    {styling ? (
                      <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_40%,transparent)] p-4 text-xs leading-relaxed">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Styling layer</p>
                        <p className="mt-2 text-[color:var(--espresso)]">
                          <span className="text-muted">Gender read:</span> {styling.genderPresentation ?? "—"}
                          {" · "}
                          <span className="text-muted">Season:</span> {styling.colorSeason ?? "—"}
                        </p>
                        {Array.isArray(styling.clothingPalette) && styling.clothingPalette.length > 0 ? (
                          <p className="mt-2 text-muted">
                            Palette:{" "}
                            <span className="text-[color:color-mix(in_srgb,var(--espresso)_90%,#333)]">
                              {styling.clothingPalette.slice(0, 8).join(", ")}
                              {styling.clothingPalette.length > 8 ? "…" : ""}
                            </span>
                          </p>
                        ) : null}
                        {styling.masculineGrooming ? (
                          <p className="mt-2 line-clamp-4 text-muted">
                            <span className="font-semibold text-[color:var(--espresso)]">Grooming:</span>{" "}
                            {styling.masculineGrooming}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {wellness?.texture?.summary ? (
                      <div className="rounded-xl border border-dashed border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] p-4 text-xs text-muted">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Wellness · texture</p>
                        <p className="mt-2 leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_88%,#333)]">
                          {wellness.texture.summary}
                        </p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">AI recommendation</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_88%,#333)]">
                        {c.aiRecommendation}
                      </p>
                    </div>
                    <details className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] bg-[color:color-mix(in_srgb,var(--sand)_25%,#fff)] p-3 text-[11px]">
                      <summary className="cursor-pointer font-semibold uppercase tracking-[0.18em] text-muted">
                        Full analysis JSON
                      </summary>
                      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-[color:color-mix(in_srgb,var(--espresso)_75%,#444)]">
                        {c.analysisResult}
                      </pre>
                    </details>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
