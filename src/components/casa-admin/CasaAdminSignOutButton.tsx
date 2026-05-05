"use client";

import { signOut } from "next-auth/react";

export function CasaAdminSignOutButton() {
  return (
    <button
      type="button"
      className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--espresso)]"
      onClick={() => void signOut({ callbackUrl: "/casa-admin" })}
    >
      Sign out — try again
    </button>
  );
}
