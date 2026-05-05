"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "casa_admin_last_seen_order_id";
const AUDIO_UNLOCKED = "casa_admin_audio_unlocked";

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => null);
    if (ctx.state === "suspended") return;
  }
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.36);
}

export function CasaAdminNewOrderWatcher() {
  const router = useRouter();
  const [hint, setHint] = useState(false);
  const initialised = useRef(false);

  const unlockAudio = useCallback(() => {
    try {
      window.localStorage.setItem(AUDIO_UNLOCKED, "1");
    } catch {
      /* ignore */
    }
    const ctx = getAudioContext();
    void ctx?.resume().catch(() => null);
    playChime();
    setHint(false);
  }, []);

  useEffect(() => {
    const onFirstInteract = () => {
      try {
        window.localStorage.setItem(AUDIO_UNLOCKED, "1");
      } catch {
        /* ignore */
      }
      void getAudioContext()?.resume().catch(() => null);
    };
    window.addEventListener("pointerdown", onFirstInteract, { passive: true });
    return () => window.removeEventListener("pointerdown", onFirstInteract);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const res = await fetch("/api/casa-admin/orders/pulse", { cache: "no-store" });
      const j = (await res.json().catch(() => null)) as {
        ok?: boolean;
        latestId?: string | null;
        orderNumber?: string | null;
      } | null;
      if (!res.ok || !j?.ok || cancelled) return;
      const latestId = j.latestId ?? null;
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }

      if (!initialised.current) {
        initialised.current = true;
        if (latestId) {
          try {
            window.localStorage.setItem(STORAGE_KEY, latestId);
          } catch {
            /* ignore */
          }
        }
        return;
      }

      if (latestId && stored && latestId !== stored) {
        let soundOk = false;
        try {
          soundOk = window.localStorage.getItem(AUDIO_UNLOCKED) === "1";
        } catch {
          soundOk = false;
        }
        if (soundOk) playChime();
        else setHint(true);

        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          const ref = j.orderNumber ? `#${j.orderNumber}` : "New order";
          new Notification("Casa Kilicé — new order", { body: `${ref} · open the console to fulfil.` });
        }

        try {
          window.localStorage.setItem(STORAGE_KEY, latestId);
        } catch {
          /* ignore */
        }
        router.refresh();
      } else if (latestId && !stored) {
        try {
          window.localStorage.setItem(STORAGE_KEY, latestId);
        } catch {
          /* ignore */
        }
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), 7000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [router]);

  if (!hint) return null;

  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-[60] max-w-[17rem] rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-3 text-[11px] text-[color:var(--espresso)] shadow-lg">
      <p className="font-semibold">New order</p>
      <p className="mt-1 text-muted">Enable sounds and optional desktop alerts for the next one.</p>
      <button
        type="button"
        onClick={unlockAudio}
        className="mt-2 w-full rounded-lg bg-[color:var(--espresso)] py-2 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--sand-soft)]"
      >
        Enable sounds
      </button>
      {typeof Notification !== "undefined" && Notification.permission === "default" ? (
        <button
          type="button"
          onClick={() => void Notification.requestPermission().then(() => setHint(false))}
          className="mt-2 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] py-2 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--espresso)]"
        >
          Enable desktop alerts
        </button>
      ) : null}
      <button type="button" onClick={() => setHint(false)} className="mt-2 w-full text-[9px] uppercase tracking-wide text-muted hover:text-[color:var(--espresso)]">
        Dismiss
      </button>
    </div>
  );
}
