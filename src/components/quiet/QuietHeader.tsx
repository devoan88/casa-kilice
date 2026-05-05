"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/quiet/LanguageSwitcher";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/components/cart/CartProvider";
import { trackJoinClubClick } from "@/lib/analytics";
import { useI18n } from "@/i18n/LanguageProvider";

export function QuietHeader() {
  const cart = useCart();
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    lastY.current = y;
    if (y < 32) {
      setHidden(false);
      return;
    }
    if (y > prev && y > 72) setHidden(true);
    if (y < prev) setHidden(false);
  });

  useEffect(() => {
    lastY.current = scrollY.get();
  }, [scrollY]);

  useEffect(() => {
    // Lock body scroll when mobile menu open
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="h-12 shrink-0 md:h-14" aria-hidden />

      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: hidden ? "-110%" : "0%", opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-50"
        style={{
          backdropFilter: "blur(44px) saturate(1.5) brightness(0.88)",
          WebkitBackdropFilter: "blur(44px) saturate(1.5) brightness(0.88)",
          background: "linear-gradient(180deg, rgba(18,15,12,0.88) 0%, rgba(10,8,6,0.82) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(232,196,92,0.1)",
        }}
      >
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4 md:h-14 md:px-5">
          <motion.nav
            initial={{ opacity: 0.92 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden max-w-[min(100%,14rem)] flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-[color:color-mix(in_srgb,#e8dfd4_88%,var(--espresso))] md:flex md:max-w-none md:gap-x-5 md:text-xs md:tracking-[0.22em]"
            aria-label="Primary"
          >
            <Link href="/" className="transition-colors duration-500 hover:text-[color:var(--neon-amber)]">
              {t("nav_home")}
            </Link>
            <Link href="/ai-protocol" prefetch className="transition-colors duration-500 hover:text-[color:var(--neon-amber)]">
              {t("nav_ai_protocol")}
            </Link>
            <Link href="/shop" className="transition-colors duration-500 hover:text-[color:var(--neon-amber)]">
              {t("nav_shop")}
            </Link>
            <Link
              href="/membership"
              prefetch
              onClick={() => trackJoinClubClick("header_nav_club")}
              className="transition-colors duration-500 hover:text-[color:var(--neon-amber)]"
            >
              {t("nav_club")}
            </Link>
            <Link href="/creator-portal" prefetch className="transition-colors duration-500 hover:text-[color:var(--neon-amber)]">
              {t("nav_creator")}
            </Link>
            <Link
              href="/journal"
              prefetch
              className="text-[9px] font-medium uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] transition-colors duration-500 hover:text-[color:var(--neon-amber)] md:text-[10px] md:tracking-[0.22em]"
            >
              {t("nav_journal")}
            </Link>
            <Link
              href="/business"
              prefetch
              className="text-[9px] font-medium uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] transition-colors duration-500 hover:text-[color:var(--neon-amber)] md:text-[10px] md:tracking-[0.22em]"
            >
              {t("nav_business")}
            </Link>
          </motion.nav>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            {/* Mobile menu button (VisionOS glass) */}
            <button
              type="button"
              className="ck-eye-hover md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.10)] bg-[rgba(18,15,12,0.60)] text-[color:rgba(245,240,234,0.9)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[44px]"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <LanguageSwitcher compact />
            <div className="group relative">
              <div
                className="h-9 w-9 rounded-full border border-[color:color-mix(in_srgb,rgba(232,208,102)_35%,transparent)] bg-[color:color-mix(in_srgb,#12100e_75%,transparent)] shadow-[0_0_20px_rgba(232,208,102,0.12)] transition-colors duration-500 group-hover:border-[color:var(--neon-amber)]"
                aria-hidden="true"
              >
                <div className="mx-auto mt-[16px] h-[3px] w-[3px] rounded-full bg-[color:var(--neon-amber)]" />
              </div>
              <div className="pointer-events-none absolute right-0 top-11 w-52 origin-top-right scale-95 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                <div
                  className="rounded-[24px] p-2"
                  style={{
                    backdropFilter: "blur(44px) saturate(1.5)",
                    WebkitBackdropFilter: "blur(44px) saturate(1.5)",
                    background: "rgba(16,13,11,0.92)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,196,92,0.08)",
                  }}
                >
                  <Link
                    href="/exclusive"
                    className="block rounded-[14px] px-3 py-2 text-xs tracking-[0.22em] uppercase text-[color:color-mix(in_srgb,#f5f0ea_92%,transparent)] hover:bg-[color:color-mix(in_srgb,#fff_06%,transparent)]"
                  >
                    {t("secret_exclusive")}
                  </Link>
                  <Link
                    href="/rituals"
                    className="block rounded-[14px] px-3 py-2 text-xs tracking-[0.22em] uppercase text-[color:color-mix(in_srgb,#f5f0ea_92%,transparent)] hover:bg-[color:color-mix(in_srgb,#fff_06%,transparent)]"
                  >
                    {t("secret_rituals")}
                  </Link>
                  <Link
                    href="/membership/dashboard"
                    className="block rounded-[14px] px-3 py-2 text-xs tracking-[0.22em] uppercase text-[color:color-mix(in_srgb,#f5f0ea_92%,transparent)] hover:bg-[color:color-mix(in_srgb,#fff_06%,transparent)]"
                  >
                    {t("secret_lounge")}
                  </Link>
                </div>
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.05 }}
              className="rounded-full p-2 text-[color:color-mix(in_srgb,#e8dfd4_88%,transparent)] transition-colors duration-500 hover:text-[color:var(--neon-amber)]"
              onClick={() => cart.openCart()}
              aria-label={t("cart_open")}
            >
              <div className="relative">
                <ShoppingBag size={20} />
                {cart.count > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--neon-amber)] px-1 text-[10px] font-medium text-[color:var(--void)]">
                    {cart.count}
                  </span>
                ) : null}
              </div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Spatial Glass Menu Overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(50px) saturate(1.6) brightness(0.9)",
              WebkitBackdropFilter: "blur(50px) saturate(1.6) brightness(0.9)",
              background:
                "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(232,196,92,0.10) 0%, rgba(5,4,3,0.92) 60%, rgba(5,4,3,0.98) 100%)",
            }}
            aria-hidden
          />

          <div className="relative mx-auto flex h-full max-w-md flex-col px-6 py-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[color:rgba(232,196,92,0.85)]">
                Casa Kilicé
              </p>
              <button
                type="button"
                className="ck-eye-hover inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgba(255,255,255,0.10)] bg-[rgba(18,15,12,0.60)] text-[color:rgba(245,240,234,0.9)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[44px]"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-10 space-y-3">
              {[
                { href: "/", label: t("nav_home") },
                { href: "/ai-protocol", label: t("nav_ai_protocol") },
                { href: "/shop", label: t("nav_shop") },
                { href: "/membership", label: t("nav_club") },
                { href: "/creator-portal", label: t("nav_creator") },
                { href: "/journal", label: t("nav_journal") },
                { href: "/business", label: t("nav_business") },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  prefetch
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-[22px] border border-[color:rgba(255,255,255,0.08)] bg-[rgba(18,15,12,0.55)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:rgba(245,240,234,0.92)] shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-[44px] transition-transform active:scale-[0.99]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  cart.openCart();
                }}
                className="block w-full rounded-[22px] border border-[color:rgba(232,196,92,0.22)] bg-[rgba(232,196,92,0.08)] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:rgba(232,196,92,0.92)] shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-[44px]"
              >
                {t("cart_open")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CartDrawer />
    </>
  );
}
