"use client";

import { SessionProvider } from "next-auth/react";

import { CommerceProvider } from "@/components/commerce/CommerceProvider";
import { DeliveryZoneProvider } from "@/components/logistics/DeliveryZoneProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n/types";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <SessionProvider>
      <LanguageProvider initialLocale={initialLocale}>
        <CommerceProvider>
          <DeliveryZoneProvider>{children}</DeliveryZoneProvider>
        </CommerceProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}

