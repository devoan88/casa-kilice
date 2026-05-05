"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type CasaAdminMuseRow = {
  id: string;
  type: string;
  createdAt: string;
  userName: string | null;
  instagramHandle: string | null;
};

export function CasaAdminMuseGrid({ rows }: { rows: CasaAdminMuseRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="text-sm text-muted">No pending muse submissions.</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => {
          const src = `/api/casa-admin/muse/submissions/${r.id}/file`;
          const isVideo = r.type === "Video";
          return (
            <li
              key={r.id}
              className="overflow-hidden rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] shadow-sm"
            >
              <div className="aspect-[4/3] bg-[color:var(--sand-soft)]">
                {isVideo ? (
                  <video src={src} className="h-full w-full object-cover" controls muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-only authenticated stream URL
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{r.type}</p>
                <p className="font-medium text-[color:var(--espresso)]">{r.userName ?? "—"}</p>
                <p className="text-sm text-muted">
                  Instagram: <span className="font-mono text-[color:var(--espresso)]">{r.instagramHandle ?? "—"}</span>
                </p>
                <p className="text-[10px] text-muted">
                  {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={async () => {
                    setError(null);
                    setBusy(r.id);
                    try {
                      const res = await fetch("/api/casa-admin/muse/approve", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ submissionId: r.id }),
                      });
                      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                      if (!res.ok || !json.ok) {
                        setError(json?.error ?? "Approval failed.");
                        return;
                      }
                      router.refresh();
                    } finally {
                      setBusy(null);
                    }
                  }}
                  className="mt-2 w-full rounded-full bg-[color:var(--espresso)] py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)] disabled:opacity-50"
                >
                  {busy === r.id ? "Approving…" : "Approve"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
