import type { Metadata } from "next";

import { ScanExperience } from "./ScanExperience";

export const metadata: Metadata = {
  title: "AI Skin & Wellness Scan",
  description:
    "Holistic AI skin scan with texture, hydration, routine, lifestyle, and sun safety — Casa Kilicé concierge.",
  keywords: ["AI Skin Scan", "wellness scan", "Casa Kilicé"],
};

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Dedicated scan page</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[color:var(--espresso)] md:text-4xl">
        AI Skin &amp; wellness
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Same experience as the concierge headset on the home page — use this URL to bookmark or share. Sign in and
        upload a selfie for the full vision-guided protocol.
      </p>
      <div className="mt-8">
        <ScanExperience />
      </div>
    </div>
  );
}
