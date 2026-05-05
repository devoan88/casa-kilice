"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AssetSvg } from "@/components/AssetSvg";
import { productAssetPath } from "@/lib/productMedia";
import Link from "next/link";
import { Lock, MessageCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { ConciergeModal } from "@/components/future/ConciergeModal";
import { MembershipProgressRing } from "@/components/membership/MembershipProgressRing";
import { VelvetSparkles } from "@/components/membership/VelvetSparkles";

type Tier = "SILK" | "GOLD" | "VELVET";

type LoungePayload = {
  tier: Tier;
  percent: number;
  nextTier: Tier | null;
  streak: number;
  orders: number;
  name: string | null;
  email: string | null;
  purchases: { id: string; productName: string; createdAt: string; status: string }[];
};

type TabId = "overview" | "rituals" | "vault" | "gifts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tierRank: Record<Tier, number> = { SILK: 1, GOLD: 2, VELVET: 3 };

const GIFTS: { id: string; title: string; detail: string; minTier: Tier }[] = [
  {
    id: "wrap",
    title: "Free Silk Wrap",
    detail: "On your next order â€” a tactile welcome.",
    minTier: "SILK",
  },
  {
    id: "samples",
    title: "Luxury Samples",
    detail: "Curated miniatures matched to your ritual.",
    minTier: "GOLD",
  },
  {
    id: "birthday",
    title: "Birthday Exclusives",
    detail: "A private note and a limited surprise.",
    minTier: "GOLD",
  },
  {
    id: "vault",
    title: "The Vault Preview",
    detail: "First look at hidden drops before the world.",
    minTier: "VELVET",
  },
  {
    id: "glove",
    title: "White Glove Delivery",
    detail: "Signature handling from atelier to door.",
    minTier: "VELVET",
  },
];

const VAULT_ITEMS = [
  { name: "Nocturne Reserve", label: "Exclusive for You" },
  { name: "Maison dâ€™Or Serum", label: "Coming Soon" },
  { name: "Velvet Veil Powder", label: "Exclusive for You" },
];

export default function MembershipDashboardPage() {
  const { data, status } = useSession();
  const [lounge, setLounge] = useState<LoungePayload | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [conciergeOpen, setConciergeOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/membership/lounge", { cache: "no-store" });
    if (!res.ok) return;
    setLounge((await res.json()) as LoungePayload);
  }, []);

  useEffect(() => {
    if (status === "authenticated") void load();
  }, [status, load]);

  const velvet = lounge?.tier === "VELVET";

  const ritualDays = useMemo(() => {
    const names = Array.from(
      new Set((lounge?.purchases ?? []).map((p) => p.productName)),
    );
    if (names.length === 0) {
      return DAYS.map((d) => ({ day: d, label: "â€”", empty: true }));
    }
    return DAYS.map((d, i) => ({
      day: d,
      label: names[i % names.length] ?? "â€”",
      empty: false,
    }));
  }, [lounge?.purchases]);

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-24 text-sm text-muted">
        Entering your loungeâ€¦
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-24">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">
          Members Only
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          Your private lounge awaits.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Sign in to open your membership dashboard, ritual calendar, and
          concierge line.
        </p>
        <Link
          href="/account/sign-in?callbackUrl=/membership/dashboard"
          className="ck-metallic mt-8 inline-flex h-11 items-center justify-center rounded-full px-8 text-xs tracking-[0.22em] uppercase"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div
      className={[
        "relative min-h-[calc(100vh-8rem)] w-full overflow-hidden",
        velvet ? "bg-[color:color-mix(in_srgb,var(--chocolate)_88%,#140c08_12%)] text-[color:var(--cream-warm)]" : "",
      ].join(" ")}
    >
      {velvet ? <VelvetSparkles /> : null}

      <div className="relative mx-auto w-full max-w-6xl px-5 py-12 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={[
            "flex flex-col gap-8 rounded-[32px] border p-8 md:flex-row md:items-center md:justify-between md:p-10",
            velvet
              ? "border-[color:rgba(243,229,171,0.22)] bg-[color:rgba(242,232,218,0.06)]"
              : "border-border bg-[color:var(--surface)]",
          ].join(" ")}
        >
          <div className="flex items-center gap-8">
            <MembershipProgressRing
              percent={lounge?.percent ?? 0}
              tier={lounge?.tier ?? "SILK"}
            />
            <div>
              <p
                className={[
                  "text-[11px] tracking-[0.34em] uppercase",
                  velvet ? "text-[color:var(--gold)]" : "text-muted",
                ].join(" ")}
              >
                Member status
              </p>
              <p
                className={[
                  "mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight",
                  velvet ? "text-[color:var(--gold-2)]" : "text-foreground",
                ].join(" ")}
              >
                {lounge?.tier ?? "SILK"}
              </p>
              <p
                className={[
                  "mt-2 text-sm",
                  velvet ? "text-[color:rgba(235,225,210,0.72)]" : "text-muted",
                ].join(" ")}
              >
                {lounge?.nextTier
                  ? `Ascent toward ${lounge.nextTier}: ${lounge.percent}% complete`
                  : "Velvet achieved â€” the innermost room is yours."}
              </p>
              <p
                className={[
                  "mt-3 text-xs tracking-[0.18em] uppercase",
                  velvet ? "text-[color:rgba(235,225,210,0.55)]" : "text-muted",
                ].join(" ")}
              >
                {lounge?.name ?? data?.user?.name ?? "Member"} Â·{" "}
                {lounge?.email ?? data?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href="/membership"
              className={[
                "inline-flex h-11 items-center justify-center rounded-full border px-6 text-xs tracking-[0.22em] uppercase",
                velvet
                  ? "border-[color:rgba(243,229,171,0.35)] text-[color:var(--gold-2)] hover:bg-[color:rgba(242,232,218,0.08)]"
                  : "border-border text-foreground hover:border-[color:var(--gold)]",
              ].join(" ")}
            >
              The Ascent
            </Link>
            <Link
              href="/shop"
              className={[
                "inline-flex h-11 items-center justify-center rounded-full border px-6 text-xs tracking-[0.22em] uppercase",
                velvet
                  ? "border-[color:rgba(243,229,171,0.35)] text-[color:var(--gold-2)] hover:bg-[color:rgba(242,232,218,0.08)]"
                  : "border-border text-foreground hover:border-[color:var(--gold)]",
              ].join(" ")}
            >
              Boutique
            </Link>
          </div>
        </motion.header>

        <div
          className={[
            "mt-10 flex flex-wrap gap-2 border-b pb-4",
            velvet ? "border-[color:rgba(243,229,171,0.18)]" : "border-border",
          ].join(" ")}
        >
          {(
            [
              ["overview", "Overview"],
              ["rituals", "Ritual Calendar"],
              ["vault", "The Vault"],
              ["gifts", "Exclusive Gifts"],
            ] as const
          ).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={[
                  "rounded-full px-4 py-2 text-xs tracking-[0.22em] uppercase transition-colors",
                  active
                    ? velvet
                      ? "bg-[color:rgba(243,229,171,0.16)] text-[color:var(--gold-2)]"
                      : "bg-[color:var(--surface-strong)] text-foreground"
                    : velvet
                      ? "text-[color:rgba(235,225,210,0.55)] hover:text-[color:var(--gold-2)]"
                      : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-8 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {tab === "overview" ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <section
                    className={[
                      "rounded-[28px] border p-7",
                      velvet
                        ? "border-[color:rgba(243,229,171,0.18)] bg-[color:rgba(242,232,218,0.06)]"
                        : "border-border bg-[color:var(--surface)]",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-xs tracking-[0.28em] uppercase",
                        velvet ? "text-[color:var(--gold)]" : "text-muted",
                      ].join(" ")}
                    >
                      Direct line
                    </p>
                    <h2
                      className={[
                        "mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight",
                        velvet ? "text-[color:var(--gold-2)]" : "text-foreground",
                      ].join(" ")}
                    >
                      Beauty Concierge
                    </h2>
                    <p
                      className={[
                        "mt-2 text-sm",
                        velvet
                          ? "text-[color:rgba(235,225,210,0.72)]"
                          : "text-muted",
                      ].join(" ")}
                    >
                      A private channel â€” like the quietest chat thread, reserved
                      for you.
                    </p>
                    <div
                      className={[
                        "mt-5 space-y-3 rounded-[22px] border p-4",
                        velvet
                          ? "border-[color:rgba(243,229,171,0.14)] bg-[color:color-mix(in_srgb,var(--chocolate)_92%,#0f0907_8%)]"
                          : "border-border bg-[color:var(--surface-strong)]",
                      ].join(" ")}
                    >
                      <div className="flex justify-end">
                        <span
                          className={[
                            "max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2 text-sm",
                            velvet
                              ? "bg-[#123524] text-[#dff7ea]"
                              : "bg-[#123524] text-[#dff7ea]",
                          ].join(" ")}
                        >
                          Shall we refine your morning ritual today?
                        </span>
                      </div>
                      <div className="flex justify-start">
                        <span
                          className={[
                            "max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2 text-sm",
                            velvet
                              ? "bg-[color:rgba(242,232,218,0.1)] text-[color:rgba(235,225,210,0.9)]"
                              : "bg-[color:var(--surface)] text-foreground",
                          ].join(" ")}
                        >
                          Yes â€” Iâ€™d love a quiet recommendation.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConciergeOpen(true)}
                      className={[
                        "mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-xs tracking-[0.22em] uppercase",
                        velvet
                          ? "border border-[color:rgba(243,229,171,0.35)] text-[color:var(--gold-2)] hover:bg-[color:rgba(242,232,218,0.08)]"
                          : "ck-metallic",
                      ].join(" ")}
                    >
                      <MessageCircle size={16} />
                      Open concierge
                    </button>
                  </section>

                  <section
                    className={[
                      "rounded-[28px] border p-7",
                      velvet
                        ? "border-[color:rgba(243,229,171,0.18)] bg-[color:rgba(242,232,218,0.06)]"
                        : "border-border bg-[color:var(--surface)]",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-xs tracking-[0.28em] uppercase",
                        velvet ? "text-[color:var(--gold)]" : "text-muted",
                      ].join(" ")}
                    >
                      Pulse
                    </p>
                    <h2
                      className={[
                        "mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight",
                        velvet ? "text-[color:var(--gold-2)]" : "text-foreground",
                      ].join(" ")}
                    >
                      Ritual streak & orders
                    </h2>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div
                        className={[
                          "rounded-[20px] border p-5",
                          velvet
                            ? "border-[color:rgba(243,229,171,0.14)]"
                            : "border-border bg-[color:var(--surface-strong)]",
                        ].join(" ")}
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                          Glow streak
                        </p>
                        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                          {lounge?.streak ?? 0}
                        </p>
                      </div>
                      <div
                        className={[
                          "rounded-[20px] border p-5",
                          velvet
                            ? "border-[color:rgba(243,229,171,0.14)]"
                            : "border-border bg-[color:var(--surface-strong)]",
                        ].join(" ")}
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                          Orders
                        </p>
                        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                          {lounge?.orders ?? 0}
                        </p>
                      </div>
                    </div>
                    <p
                      className={[
                        "mt-5 text-sm",
                        velvet
                          ? "text-[color:rgba(235,225,210,0.72)]"
                          : "text-muted",
                      ].join(" ")}
                    >
                      Purchases linked to your account appear in your ritual
                      calendar. Checkout orders will connect here as your journey
                      deepens.
                    </p>
                  </section>
                </div>
              ) : null}

              {tab === "rituals" ? (
                <section
                  className={[
                    "rounded-[28px] border p-8",
                    velvet
                      ? "border-[color:rgba(243,229,171,0.18)] bg-[color:rgba(242,232,218,0.06)]"
                      : "border-border bg-[color:var(--surface)]",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-xs tracking-[0.28em] uppercase",
                      velvet ? "text-[color:var(--gold)]" : "text-muted",
                    ].join(" ")}
                  >
                    Daily Beauty Ritual
                  </p>
                  <h2
                    className={[
                      "mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight",
                      velvet ? "text-[color:var(--gold-2)]" : "text-foreground",
                    ].join(" ")}
                  >
                    Ritual calendar
                  </h2>
                  <p
                    className={[
                      "mt-2 max-w-2xl text-sm",
                      velvet
                        ? "text-[color:rgba(235,225,210,0.72)]"
                        : "text-muted",
                    ].join(" ")}
                  >
                    Your purchased products mapped to a quiet week of care.
                  </p>
                  <div className="mt-8 grid grid-cols-7 gap-2 md:gap-3">
                    {ritualDays.map((d) => (
                      <div
                        key={d.day}
                        className={[
                          "flex flex-col rounded-[18px] border p-3 text-center md:p-4",
                          velvet
                            ? "border-[color:rgba(243,229,171,0.14)] bg-[color:color-mix(in_srgb,var(--chocolate)_92%,#0f0907_8%)]"
                            : "border-border bg-[color:var(--surface-strong)]",
                        ].join(" ")}
                      >
                        <p className="text-[10px] tracking-[0.22em] uppercase text-muted">
                          {d.day}
                        </p>
                        <p
                          className={[
                            "mt-3 text-[11px] leading-snug md:text-xs",
                            d.empty
                              ? "text-muted"
                              : velvet
                                ? "text-[color:rgba(235,225,210,0.92)]"
                                : "text-foreground",
                          ].join(" ")}
                        >
                          {d.empty ? "Your ritual" : d.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  {ritualDays.every((x) => x.empty) ? (
                    <div className="mt-8 text-center">
                      <p
                        className={[
                          "text-sm",
                          velvet
                            ? "text-[color:rgba(235,225,210,0.72)]"
                            : "text-muted",
                        ].join(" ")}
                      >
                        No purchases on file yet. Begin with a signature piece.
                      </p>
                      <Link
                        href="/shop"
                        className="ck-metallic mt-5 inline-flex h-11 items-center justify-center rounded-full px-8 text-xs tracking-[0.22em] uppercase"
                      >
                        Explore the collection
                      </Link>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {tab === "vault" ? (
                <section
                  className={[
                    "relative overflow-hidden rounded-[28px] border p-8",
                    velvet
                      ? "border-[color:rgba(243,229,171,0.22)] bg-[color:color-mix(in_srgb,var(--chocolate)_92%,#0f0907_8%)]"
                      : "border-border bg-[color:var(--surface)]",
                  ].join(" ")}
                >
                  {!velvet ? (
                    <>
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[color:rgba(6,6,6,0.55)] px-6 text-center backdrop-blur-sm">
                        <Lock className="text-[color:var(--gold)]" size={22} />
                        <p className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--gold-2)]">
                          The Vault
                        </p>
                        <p className="max-w-md text-sm text-[color:rgba(235,225,210,0.75)]">
                          Velvet members only. Ascend to unlock hidden products and
                          private releases.
                        </p>
                      </div>
                      <div className="blur-sm">
                        <VaultGrid velvet={false} />
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-[color:var(--gold)]" size={18} />
                        <p className="text-xs tracking-[0.28em] uppercase text-[color:var(--gold)]">
                          Velvet Â· The Vault
                        </p>
                      </div>
                      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[color:var(--gold-2)]">
                        Secret products
                      </h2>
                      <VaultGrid velvet />
                    </div>
                  )}
                </section>
              ) : null}

              {tab === "gifts" ? (
                <section
                  className={[
                    "rounded-[28px] border p-8",
                    velvet
                      ? "border-[color:rgba(243,229,171,0.18)] bg-[color:rgba(242,232,218,0.06)]"
                      : "border-border bg-[color:var(--surface)]",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-xs tracking-[0.28em] uppercase",
                      velvet ? "text-[color:var(--gold)]" : "text-muted",
                    ].join(" ")}
                  >
                    Unlocked privileges
                  </p>
                  <h2
                    className={[
                      "mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight",
                      velvet ? "text-[color:var(--gold-2)]" : "text-foreground",
                    ].join(" ")}
                  >
                    Exclusive gifts
                  </h2>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {GIFTS.map((g) => {
                      const unlocked =
                        tierRank[lounge?.tier ?? "SILK"] >= tierRank[g.minTier];
                      return (
                        <div
                          key={g.id}
                          className={[
                            "rounded-[22px] border p-6",
                            velvet
                              ? "border-[color:rgba(243,229,171,0.16)] bg-[color:color-mix(in_srgb,var(--chocolate)_92%,#0f0907_8%)]"
                              : "border-border bg-[color:var(--surface-strong)]",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs tracking-[0.22em] uppercase text-muted">
                                {g.minTier}
                              </p>
                              <p
                                className={[
                                  "mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight",
                                  velvet
                                    ? "text-[color:var(--gold-2)]"
                                    : "text-foreground",
                                ].join(" ")}
                              >
                                {g.title}
                              </p>
                              <p
                                className={[
                                  "mt-2 text-sm",
                                  velvet
                                    ? "text-[color:rgba(235,225,210,0.72)]"
                                    : "text-muted",
                                ].join(" ")}
                              >
                                {g.detail}
                              </p>
                            </div>
                            <span
                              className={[
                                "shrink-0 rounded-full border px-3 py-1 text-[10px] tracking-[0.22em] uppercase",
                                unlocked
                                  ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                                  : "border-border text-muted line-through opacity-60",
                              ].join(" ")}
                            >
                              {unlocked ? "Unlocked" : "Locked"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ConciergeModal open={conciergeOpen} onClose={() => setConciergeOpen(false)} />
    </div>
  );
}

function VaultGrid({ velvet }: { velvet: boolean }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {VAULT_ITEMS.map((item) => (
        <div
          key={item.name}
          className={[
            "overflow-hidden rounded-[24px] border",
            velvet
              ? "border-[color:rgba(243,229,171,0.18)] bg-[color:rgba(242,232,218,0.06)]"
              : "border-border bg-[color:var(--surface-strong)]",
          ].join(" ")}
        >
          <div className="relative aspect-[4/3] bg-[#111]">
            <AssetSvg
              src={productAssetPath("packaging")}
              alt={item.name}
              className="absolute inset-0 h-full w-full opacity-60"
              fit="slice"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:rgba(45,27,27,0.62)] to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-[color:rgba(243,229,171,0.35)] bg-[color:rgba(45,27,27,0.48)] px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-[color:var(--gold-2)]">
              {item.label}
            </span>
          </div>
          <div className="p-5">
            <p
              className={[
                "font-[family-name:var(--font-display)] text-xl tracking-tight",
                velvet ? "text-[color:var(--gold-2)]" : "text-foreground",
              ].join(" ")}
            >
              {item.name}
            </p>
            <p
              className={[
                "mt-2 text-sm",
                velvet ? "text-[color:rgba(235,225,210,0.7)]" : "text-muted",
              ].join(" ")}
            >
              Reserved for the inner circle.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
