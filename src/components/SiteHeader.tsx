import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { AuthButtons } from "@/components/AuthButtons";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const isAdmin =
    Boolean(adminEmail) &&
    session?.user?.email?.toLowerCase() === adminEmail?.toLowerCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[color-mix(in_srgb,var(--background)_82%,white_18%)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm tracking-wide text-foreground md:flex">
          <Link href="/shop" className="hover:text-[color:var(--accent-strong)]">
            Shop
          </Link>
          <Link
            href="/story"
            className="hover:text-[color:var(--accent-strong)]"
          >
            Our Story
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/visitors"
              className="hover:text-[color:var(--accent-strong)]"
            >
              Visitors
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

