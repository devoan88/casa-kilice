import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { TwoFactorSettings } from "./TwoFactorSettings";

export default async function AccountSecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/account/sign-in?callbackUrl=/account/security");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="rounded-[32px] border border-border bg-surface p-7 md:p-10">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">Account</p>
        <h1 className="mt-3 text-3xl tracking-tight">Security</h1>
        <p className="mt-2 text-sm text-muted">
          Signed in as <span className="text-foreground">{session.user.email}</span>
        </p>

        <TwoFactorSettings />

        <p className="mt-10 text-sm text-muted">
          <Link href="/account" className="underline decoration-[color:var(--accent-strong)] underline-offset-4">
            ← Back to account
          </Link>
        </p>
      </div>
    </div>
  );
}
