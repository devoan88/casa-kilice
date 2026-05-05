"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useState } from "react";

import { BeautyConcierge } from "@/components/quiet/BeautyConcierge";
import { HomeInfoPanel } from "@/components/home/HomeInfoPanel";
import { HomeProductFilmstrip } from "@/components/home/HomeProductFilmstrip";
import { HomeToneBoard } from "@/components/home/HomeToneBoard";
import { TextureScrollReveal } from "@/components/home/TextureScrollReveal";
import { trackJoinClubClick } from "@/lib/analytics";
import type { PublicSiteContent } from "@/lib/siteContent";
import { useI18n } from "@/i18n/LanguageProvider";

export function HomeClient({ siteContent }: { siteContent: PublicSiteContent | null }) {
  const { t } = useI18n();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="relative z-10 min-h-0 w-full">
        <div className="relative isolate min-h-0 w-full">
          <TextureScrollReveal hero={siteContent} />
        </div>
        <HomeProductFilmstrip />
        <HomeToneBoard />

        <footer className="relative border-t border-[color:color-mix(in_srgb,rgba(232,196,92)_14%,transparent)] bg-[#050403] px-6 py-12 text-center">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-20"
            aria-hidden
            style={{
              backgroundImage: "radial-gradient(ellipse 70% 80% at 50% 0%, rgba(232,196,92,0.12), transparent 70%)",
            }}
          />
          <nav className="relative z-10 mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-12 gap-y-4" aria-label="Site">
            <Link
              href="/shop"
              prefetch
              className="text-[10px] font-medium uppercase tracking-[0.34em] text-[color:rgba(232,196,92,0.72)] transition-all hover:text-[color:rgba(232,196,92,1)]"
            >
              {t("nav_shop")}
            </Link>
            <Link
              href="/membership"
              prefetch
              onClick={() => trackJoinClubClick("home_footer_club")}
              className="text-[10px] font-medium uppercase tracking-[0.34em] text-[color:rgba(232,196,92,0.72)] transition-all hover:text-[color:rgba(232,196,92,1)]"
            >
              {t("nav_club")}
            </Link>
          </nav>
          <p className="relative z-10 mt-6 text-[9px] uppercase tracking-[0.28em] text-[color:rgba(245,240,234,0.22)]">
            Casa Kilicé · 2030
          </p>
        </footer>

        <BeautyConcierge />
      </div>

      <button
        type="button"
        onClick={() => setInfoOpen(true)}
        className="fixed bottom-6 right-6 z-[40] flex h-12 w-12 items-center justify-center rounded-full border border-[color:rgba(232,196,92,0.28)] bg-[color:color-mix(in_srgb,#0a0908_85%,transparent)] text-[color:rgba(232,196,92,0.85)] shadow-[0_0_24px_rgba(232,196,92,0.10),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-[14px] transition-all hover:scale-[1.06] hover:shadow-[0_0_32px_rgba(232,196,92,0.22)]"
        aria-label={t("home_more_info")}
      >
        <Info size={20} strokeWidth={1.35} />
      </button>

      <HomeInfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
