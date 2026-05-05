"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { CasaAdminTodoWidget } from "@/components/casa-admin/CasaAdminTodoWidget";

const COMMERCE = [
  { href: "/casa-admin", label: "Overview", exact: true },
  { href: "/casa-admin/finance", label: "Finance", exact: false },
  { href: "/casa-admin/orders", label: "Orders", exact: false },
  { href: "/casa-admin/products", label: "Products", exact: false },
  { href: "/casa-admin/customers", label: "Customers", exact: false },
  { href: "/casa-admin/abandoned-carts", label: "Abandoned carts", exact: false },
] as const;

const SITE = [
  { href: "/casa-admin/content", label: "Homepage", exact: false },
  { href: "/casa-admin/marketing", label: "Marketing", exact: false },
  { href: "/casa-admin/creators", label: "Creators", exact: false },
  { href: "/casa-admin/muse", label: "Muse", exact: false },
  { href: "/casa-admin/consultations", label: "Consultations", exact: false },
  { href: "/casa-admin/skin-scan-insights", label: "Skin insights", exact: false },
  { href: "/casa-admin/saas", label: "Skin API SaaS", exact: false },
  { href: "/casa-admin/users", label: "Users", exact: false },
] as const;

function linkClass(active: boolean) {
  return [
    "rounded-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
    active
      ? "bg-[color:color-mix(in_srgb,rgba(232,208,102)_22%,#1a1816)] text-[color:color-mix(in_srgb,#f5f0ea_95%,transparent)] shadow-[0_0_24px_rgba(232,208,102,0.12)]"
      : "text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] hover:bg-[color:color-mix(in_srgb,#fff_06%,transparent)] hover:text-[color:var(--neon-amber)]",
  ].join(" ");
}

function NavBlock({
  title,
  links,
  pathname,
}: {
  title: string;
  links: readonly { href: string; label: string; exact: boolean }[];
  pathname: string | null;
}) {
  return (
    <div className="px-2 py-2 md:px-3">
      <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[color:color-mix(in_srgb,#e8dfd4_42%,transparent)]">
        {title}
      </p>
      <div className="flex flex-row flex-wrap gap-1 md:flex-col md:gap-0.5">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={linkClass(!!active)}>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CasaAdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent md:h-full">
      <div className="hidden border-b border-[color:rgba(232,196,92,0.12)] px-5 py-6 md:block">
        <div className="flex items-center gap-2">
          {/* Live pulse dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:rgba(232,196,92,0.6)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[color:rgba(232,196,92,0.95)]" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:rgba(232,196,92,0.95)]">
            Casa Kilicé
          </p>
        </div>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[color:rgba(245,240,234,0.95)]">
          Command Center
        </p>
        <p className="mt-0.5 text-[9px] font-mono uppercase tracking-[0.22em] text-[color:rgba(232,196,92,0.45)]">
          Spatial Console · 2030
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-[color:color-mix(in_srgb,rgba(232,208,102)_12%,transparent)] px-4 py-3 md:hidden">
        <p className="font-[family-name:var(--font-display)] text-sm text-[color:color-mix(in_srgb,#f5f0ea_92%,transparent)]">Console</p>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="shrink-0 rounded-lg px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] hover:text-[color:var(--neon-amber)]"
        >
          Sign out
        </button>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
        <NavBlock title="Commerce" links={COMMERCE} pathname={pathname} />
        <div className="mx-3 my-2 hidden h-px bg-[color:color-mix(in_srgb,rgba(232,208,102)_12%,transparent)] md:block" />
        <NavBlock title="Site & community" links={SITE} pathname={pathname} />
      </nav>
      <div className="hidden shrink-0 md:block">
        <CasaAdminTodoWidget />
      </div>
      <div className="hidden border-t border-[color:color-mix(in_srgb,rgba(232,208,102)_12%,transparent)] p-3 md:block">
        <Link
          href="/"
          className="block rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] hover:text-[color:var(--neon-amber)]"
        >
          ← Site home
        </Link>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] hover:text-[color:var(--neon-amber)]"
        >
          Sign out
        </button>
      </div>
      <div className="border-t border-[color:color-mix(in_srgb,rgba(232,208,102)_12%,transparent)] p-2 md:hidden">
        <Link
          href="/"
          className="block rounded-lg px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)] hover:text-[color:var(--neon-amber)]"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
