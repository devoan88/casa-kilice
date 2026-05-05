"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data } = useSession();
  const signedIn = Boolean(data?.user?.email);

  if (!signedIn) {
    return (
      <Link
        href="/account/sign-in"
        className="rounded-full border border-border bg-surface px-4 py-2 text-sm tracking-wide text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-border bg-surface px-4 py-2 text-sm tracking-wide text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
    >
      Sign out
    </button>
  );
}

