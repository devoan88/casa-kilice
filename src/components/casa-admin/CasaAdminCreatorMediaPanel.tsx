"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export type CreatorMediaRow = { id: string; type: string; createdAt: string };

export function CasaAdminCreatorMediaPanel({ creatorId, media }: { creatorId: string; media: CreatorMediaRow[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onPickFile(f: File | null) {
    if (!f) return;
    setErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", f);
      const res = await fetch(`/api/casa-admin/creators/${creatorId}/media`, { method: "POST", body: fd });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? "Upload failed.");
        return;
      }
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeMedia(id: string) {
    if (!confirm("Remove this file from storage?")) return;
    setBusyId(id);
    setErr(null);
    try {
      const res = await fetch(`/api/casa-admin/creators/${creatorId}/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setErr("Could not delete.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const src = (id: string) => `/api/casa-admin/creators/${creatorId}/media/${id}/file`;

  return (
    <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">UGC library</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">Photos and videos produced for Casa Kilicé. Files stay private to this console.</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload photo / video"}
          </button>
        </div>
      </div>

      {err ? <p className="mt-4 text-sm text-red-800">{err}</p> : null}

      {media.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">No uploads yet.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((m) => (
            <li
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:var(--surface)]"
            >
              <div className="aspect-square bg-[color:color-mix(in_srgb,var(--espresso)_04%,transparent)]">
                {m.type === "Photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src(m.id)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video src={src(m.id)} className="h-full w-full object-cover" muted playsInline controls />
                )}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] px-2 py-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">{m.type}</span>
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => void removeMedia(m.id)}
                  className="text-[9px] font-semibold uppercase tracking-wide text-red-800 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
