import type { Metadata } from "next";
import { cookies } from "next/headers";

import { Providers } from "@/components/Providers";
import { CartProvider } from "@/components/cart/CartProvider";
import { MoodProvider } from "@/components/future/MoodProvider";
import { LOCALE_STORAGE, LOCALES, type Locale } from "@/i18n/types";

console.log("APP_STARTING");

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Casa Kilicé (diagnostic shell)",
};

/**
 * TEMP (500 diagnostics): no prisma/auth/fonts/header/footer/heavy visuals — only the provider
 * stack pages need for hooks (`useSession`, `useMood`, `useI18n`, cart/commerce).
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieLocale = (await cookies()).get(LOCALE_STORAGE)?.value;
  const initialLocale: Locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale) ? (cookieLocale as Locale) : "en";

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <Providers initialLocale={initialLocale}>
          <MoodProvider>
            <CartProvider>{children}</CartProvider>
          </MoodProvider>
        </Providers>
      </body>
    </html>
  );
}
