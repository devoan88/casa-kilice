import type { ReactNode } from "react";
import { getServerSession } from "next-auth/next";

import { CasaAdminLoginForm } from "@/components/casa-admin/CasaAdminLoginForm";
import { CasaAdminNav } from "@/components/casa-admin/CasaAdminNav";
import { CasaAdminSignOutButton } from "@/components/casa-admin/CasaAdminSignOutButton";
import { CasaAdminNewOrderWatcher } from "@/components/casa-admin/CasaAdminNewOrderWatcher";
import { authOptions } from "@/lib/auth";
import { resolveUserCasaAdminAccess } from "@/lib/casaAdminAuth";

export default async function CasaAdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-[color:color-mix(in_srgb,#fff_88%,var(--sand))] px-4 py-12 text-[color:var(--espresso)]">
        <div className="w-full max-w-[22rem] rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] p-8 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Casa Kilicé</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">Private console — credentials only.</p>
          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            Same console: <code className="text-[color:var(--espresso)]">/casa-admin</code> or short link{" "}
            <code className="text-[color:var(--espresso)]">/admin</code>
          </p>
          <CasaAdminLoginForm />
        </div>
      </div>
    );
  }

  const isAdmin = await resolveUserCasaAdminAccess(session.user.id, session.user.email);
  if (!isAdmin) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-[color:color-mix(in_srgb,#fff_88%,var(--sand))] px-4 py-12 text-center text-[color:var(--espresso)]">
        <div className="max-w-md rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] p-8 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Casa Kilicé admin</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight">Access denied</h1>
          <p className="mt-3 text-sm text-muted">
            You are signed in as <span className="font-medium text-[color:var(--espresso)]">{session.user.email ?? session.user.id}</span>{" "}
            but this account is not allowed to open the admin console.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Use the email in <code className="text-[11px] text-[color:var(--espresso)]">ADMIN_EMAIL</code> with the matching{" "}
            <code className="text-[11px] text-[color:var(--espresso)]">ADMIN_PASSWORD_HASH</code> (or legacy{" "}
            <code className="text-[11px] text-[color:var(--espresso)]">ADMIN_PASSWORD</code>) from <code className="text-[11px]">.env</code>, or ask
            someone to set your user&apos;s <code className="text-[11px]">role</code> to <code className="text-[11px]">ADMIN</code> in the database. Two-factor
            accounts must use{" "}
            <a href="/account/sign-in?callbackUrl=/casa-admin" className="underline underline-offset-2">
              full sign-in
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-[10px] uppercase tracking-[0.2em]">
            <CasaAdminSignOutButton />
            <a href="/" className="rounded-full bg-[color:var(--espresso)] px-5 py-2.5 text-[color:var(--sand-soft)]">
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-svh flex-col text-[color:rgba(245,240,234,0.95)] md:flex-row"
      style={{ background: "radial-gradient(ellipse 120% 75% at 50% -10%, #1c1814 0%, #050403 55%, #080605 100%)" }}
    >
      {/* spatial depth grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,196,92,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,196,92,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden
      />
      {/* depth haze */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,196,92,0.12), transparent 55%)",
        }}
        aria-hidden
      />

      <CasaAdminNewOrderWatcher />

      {/* Sidebar — VisionOS thick glass panel */}
      <aside
        className="relative z-10 shrink-0 md:sticky md:top-0 md:h-svh md:w-[17rem]"
        style={{
          backdropFilter: "blur(44px) saturate(1.4) brightness(0.86)",
          WebkitBackdropFilter: "blur(44px) saturate(1.4) brightness(0.86)",
          background: "linear-gradient(180deg, rgba(22,18,14,0.88) 0%, rgba(12,10,8,0.86) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "inset -1px 0 0 rgba(232,196,92,0.06), 2px 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <CasaAdminNav />
      </aside>

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
