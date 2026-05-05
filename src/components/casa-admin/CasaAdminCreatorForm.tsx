"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CREATOR_COLLAB_STATUSES, CREATOR_PLATFORMS } from "@/lib/creator/constants";

export type PromoOption = { id: string; code: string };

type CreatorInitial = {
  id: string;
  name: string;
  socialLink: string;
  followerCount: number;
  platform: string;
  profileImage: string | null;
  collaborationStatus: string;
  promoCouponId: string | null;
};

type Props =
  | { mode: "create"; promoOptions: PromoOption[] }
  | { mode: "edit"; initial: CreatorInitial; promoOptions: PromoOption[] };

export function CasaAdminCreatorForm(props: Props) {
  const router = useRouter();
  const initial = props.mode === "edit" ? props.initial : null;
  const [name, setName] = useState(initial?.name ?? "");
  const [socialLink, setSocialLink] = useState(initial?.socialLink ?? "");
  const [followerCount, setFollowerCount] = useState(initial != null ? String(initial.followerCount) : "0");
  const [platform, setPlatform] = useState(initial?.platform ?? "Instagram");
  const [profileImage, setProfileImage] = useState(initial?.profileImage ?? "");
  const [collaborationStatus, setCollaborationStatus] = useState(initial?.collaborationStatus ?? "Active");
  const [promoCouponId, setPromoCouponId] = useState(initial?.promoCouponId ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const n = Number.parseInt(followerCount, 10);
      if (!Number.isFinite(n) || n < 0) {
        setErr("Follower count must be a non-negative integer.");
        return;
      }
      const body: Record<string, unknown> = {
        name: name.trim(),
        socialLink: socialLink.trim(),
        followerCount: n,
        platform,
        profileImage: profileImage.trim() === "" ? null : profileImage.trim(),
        collaborationStatus,
        promoCouponId: promoCouponId.trim() === "" ? null : promoCouponId.trim(),
      };

      if (props.mode === "create") {
        const res = await fetch("/api/casa-admin/creators", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const j = (await res.json().catch(() => null)) as { ok?: boolean; creator?: { id: string }; error?: string } | null;
        if (!res.ok || !j?.ok || !j.creator?.id) {
          setErr(j?.error ?? "Could not create creator.");
          return;
        }
        router.push(`/casa-admin/creators/${j.creator.id}`);
        router.refresh();
        return;
      }

      const res = await fetch(`/api/casa-admin/creators/${initial!.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        setErr(j?.error ?? "Could not save.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeCreator() {
    if (props.mode !== "edit") return;
    if (!confirm("Delete this creator and all uploaded UGC files? This cannot be undone.")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/casa-admin/creators/${initial!.id}`, { method: "DELETE" });
      if (!res.ok) {
        setErr("Delete failed.");
        return;
      }
      router.push("/casa-admin/creators");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {err ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{err}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium text-muted sm:col-span-2">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
            maxLength={200}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted sm:col-span-2">
          Social profile URL
          <input
            required
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            placeholder="https://instagram.com/…"
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
            maxLength={2000}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Follower count
          <input
            required
            inputMode="numeric"
            value={followerCount}
            onChange={(e) => setFollowerCount(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Platform
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
          >
            {CREATOR_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted sm:col-span-2">
          Profile image (URL)
          <input
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://… or /assets/…"
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
            maxLength={2048}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Collaboration status
          <select
            value={collaborationStatus}
            onChange={(e) => setCollaborationStatus(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
          >
            {CREATOR_COLLAB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted">
          Linked promo code
          <select
            value={promoCouponId}
            onChange={(e) => setPromoCouponId(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)]"
          >
            <option value="">— None —</option>
            {props.promoOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.code}
              </option>
            ))}
          </select>
          <span className="mt-1 font-normal text-[10px] text-muted">
            Create codes under Marketing. Checkout must use this code for sales to count here.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] pt-5">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[color:var(--espresso)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--sand-soft)] disabled:opacity-50"
        >
          {busy ? "Saving…" : props.mode === "create" ? "Create creator" : "Save changes"}
        </button>
        {props.mode === "edit" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void removeCreator()}
            className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-900 disabled:opacity-50"
          >
            Delete creator
          </button>
        ) : null}
      </div>
    </form>
  );
}
