"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";

import { trackJoinClubClick } from "@/lib/analytics";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.65, ease: "easeOut" as const },
};

const ROWS: { label: string; silk: boolean; gold: boolean; velvet: boolean }[] =
  [
    { label: "Exclusivity", silk: true, gold: true, velvet: true },
    { label: "Gifts", silk: false, gold: true, velvet: true },
    { label: "Rituals", silk: true, gold: true, velvet: true },
    { label: "Private Access", silk: false, gold: false, velvet: true },
  ];

function Cell({ on }: { on: boolean }) {
  return (
    <div className="flex justify-center py-4">
      {on ? (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--gold)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--gold)_14%,var(--surface-strong)_86%)] text-[color:var(--gold)]">
          <Check size={16} strokeWidth={2.2} />
        </span>
      ) : (
        <span className="h-8 w-8 rounded-full border border-border bg-[color:var(--surface-strong)]" />
      )}
    </div>
  );
}

export default function MembershipAscentPage() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
      <motion.header {...fadeUp} className="max-w-3xl">
        <p className="text-[11px] tracking-[0.34em] uppercase text-muted">
          Casa Kilicé Hierarchy
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl tracking-tight md:text-6xl">
          The Ascent to Elegance
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted md:text-xl">
          Join our private circle and unlock the true rituals of beauty.
        </p>
      </motion.header>

      <motion.div {...fadeUp} className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-[30px] border border-border bg-[color:var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(45,27,27,0.1)]">
          <p className="text-[11px] tracking-[0.34em] uppercase text-muted">
            Tier I
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight">
            Silk
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Soft cream entry. Early invitations and private content — your first
            step inside the maison.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground/90">
            <li className="border-t border-[color:rgba(45,27,27,0.08)] pt-3">Early Access</li>
            <li className="border-t border-[color:rgba(45,27,27,0.08)] pt-3">Private Content</li>
          </ul>
        </div>

        <div className="rounded-[30px] border border-[color:rgba(243,229,171,0.32)] bg-[color:var(--surface-strong)] p-8 shadow-[0_18px_50px_rgba(45,27,27,0.1)]">
          <p className="text-[11px] tracking-[0.34em] uppercase text-muted">
            Tier II
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight">
            Gold
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A warm glow around your membership — samples, concierge, and a more
            personal cadence.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground/90">
            <li className="border-t border-[color:rgba(45,27,27,0.08)] pt-3">Luxury Samples</li>
            <li className="border-t border-[color:rgba(45,27,27,0.08)] pt-3">Personal Concierge</li>
          </ul>
        </div>

        <div className="ck-leather ck-sade-touch rounded-[36px] border border-[color:color-mix(in_srgb,var(--gold)_38%,transparent)] p-8 text-foreground shadow-[0_28px_72px_rgba(45,27,27,0.12)]">
          <p className="text-[11px] tracking-[0.34em] uppercase text-muted">
            Tier III
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[color:color-mix(in_srgb,var(--hermes)_55%,var(--foreground)_45%)]">
            Velvet
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The deepest room: the vault, white glove delivery, and invitations to
            private evenings.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground/95">
            <li className="border-t border-[color:color-mix(in_srgb,var(--gold)_28%,transparent)] pt-3">
              The Vault
            </li>
            <li className="border-t border-[color:color-mix(in_srgb,var(--gold)_28%,transparent)] pt-3">
              White Glove Delivery
            </li>
            <li className="border-t border-[color:color-mix(in_srgb,var(--gold)_28%,transparent)] pt-3">
              Private Event Invitations
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.section {...fadeUp} className="mt-20">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">
          Privileges
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
          A quiet comparison
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">
          Minimal markers — only what matters. Each check is a promise kept in
          small, precise gestures.
        </p>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-border bg-[color:var(--surface)]">
          <div className="grid grid-cols-4 border-b border-border bg-[color:var(--surface-strong)] text-[10px] tracking-[0.22em] uppercase text-muted md:text-xs">
            <div className="px-4 py-4 md:px-6" />
            <div className="px-2 py-4 text-center md:px-4">Silk</div>
            <div className="px-2 py-4 text-center md:px-4">Gold</div>
            <div className="px-2 py-4 text-center md:px-4">Velvet</div>
          </div>
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-4 border-b border-border last:border-b-0"
            >
              <div className="flex items-center px-4 py-2 text-sm text-foreground md:px-6">
                {row.label}
              </div>
              <Cell on={row.silk} />
              <Cell on={row.gold} />
              <Cell on={row.velvet} />
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div
        {...fadeUp}
        className="mt-20 flex flex-col items-start gap-4 md:flex-row md:items-center"
      >
        <Link
          href={signedIn ? "/membership/dashboard" : "/account/sign-up"}
          prefetch
          onClick={() => trackJoinClubClick("membership_begin_ascent")}
          className="ck-metallic inline-flex h-12 min-w-[220px] items-center justify-center rounded-full px-8 text-xs tracking-[0.26em] uppercase"
        >
          Begin Your Ascent
        </Link>
        <Link
          href={signedIn ? "/membership/dashboard" : "/account/sign-in"}
          prefetch
          onClick={() => trackJoinClubClick("membership_inner_circle")}
          className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-full border border-border bg-[color:var(--surface-strong)] px-8 text-xs tracking-[0.26em] uppercase text-foreground hover:border-[color:var(--gold)]"
        >
          Join The Inner Circle
        </Link>
      </motion.div>

      <motion.p {...fadeUp} className="mt-10 text-sm text-muted">
        Already a member?{" "}
        <Link
          href="/membership/dashboard"
          className="text-foreground underline decoration-[color:var(--gold)] underline-offset-4 hover:text-[color:var(--gold)]"
        >
          Enter your private lounge
        </Link>
        .
      </motion.p>
    </div>
  );
}
