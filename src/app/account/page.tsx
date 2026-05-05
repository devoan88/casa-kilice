import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/account/sign-in?callbackUrl=/account");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="rounded-[32px] border border-border bg-surface p-7 md:p-10">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">
          Account
        </p>
        <h1 className="mt-3 text-3xl tracking-tight">Welcome</h1>
        <p className="mt-2 text-muted">
          Signed in as <span className="text-foreground">{session.user.email}</span>
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm tracking-[0.14em] text-background"
          >
            Shop
          </Link>
          <Link
            href="/account/security"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm tracking-[0.14em] text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
          >
            Security & 2FA
          </Link>
          <Link
            href="/story"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm tracking-[0.14em] text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
          >
            Our story
          </Link>
        </div>
      </div>
    </div>
  );
}

