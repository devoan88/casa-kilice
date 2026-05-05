import Link from "next/link";
import { cookies } from "next/headers";

import { formatMessage } from "@/i18n/messages";
import { LOCALES, type Locale } from "@/i18n/types";

const linkClass =
  "text-[9px] font-medium uppercase tracking-[0.38em] text-[color:color-mix(in_srgb,var(--espresso)_48%,transparent)] transition-colors duration-700 hover:text-[color:var(--hermes)] md:text-[10px]";

function localeFromCookie(raw: string | undefined): Locale {
  if (raw && (LOCALES as readonly string[]).includes(raw)) return raw as Locale;
  return "en";
}

/** Server-rendered so hrefs/labels match SSR (avoids client `t()` vs server hydration drift). */
export async function QuietFooterSecondaryNav() {
  const cookieStore = await cookies();
  const locale = localeFromCookie(cookieStore.get("ck_locale")?.value);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      <Link href="/journal" prefetch className={linkClass}>
        {formatMessage(locale, "nav_journal")}
      </Link>
      <Link href="/creator-portal" prefetch className={linkClass}>
        {formatMessage(locale, "footer_muse_link")}
      </Link>
      <Link href="/ai-protocol" prefetch className={linkClass}>
        AI Protocol
      </Link>
      <Link href="/scan" prefetch className={linkClass}>
        AI Scan
      </Link>
      <Link href="/skin-api" prefetch className={linkClass}>
        Skin API
      </Link>
      <Link href="/business" prefetch className={linkClass}>
        {formatMessage(locale, "nav_business")}
      </Link>
      <Link href="/legal/terms" prefetch className={linkClass}>
        Terms
      </Link>
    </div>
  );
}
