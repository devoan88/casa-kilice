import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Noto_Sans_Georgian, Noto_Serif_Georgian } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/Providers";
import { CartProvider } from "@/components/cart/CartProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { BrandFooter } from "@/components/brand/BrandFooter";
import { BrandHeader } from "@/components/brand/BrandHeader";
import { MainSegmentErrorBoundary } from "@/components/safety/MainSegmentErrorBoundary";
import { VisitorTracker } from "@/components/VisitorTracker";
import { LOCALE_STORAGE, LOCALES, type Locale } from "@/i18n/types";

/** Neon's driver and Prisma adapters require Node; avoid accidental Edge bundling. */
export const runtime = "nodejs";

function metadataBaseUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      return new URL(withProto);
    } catch {
      console.error("DEBUG ERROR: invalid NEXT_PUBLIC_SITE_URL — using localhost for metadataBase");
    }
  }
  return new URL("http://localhost:3000");
}

const sans = Noto_Sans_Georgian({
  variable: "--font-sans",
  subsets: ["georgian", "latin"],
  display: "swap",
});

const display = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const georgian = Noto_Serif_Georgian({
  variable: "--font-georgian",
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "Casa Kilicé — კრემისებრი ნათების წვეთი",
    template: "%s · Casa Kilicé",
  },
  description:
    "კოსმეტიკა საქართველოსთვის. კრემისებრი ნათების წვეთი ერევა ნებისმიერ ტონალურ კრემში, ანათებს და ატენიანებს სახეს.",
  keywords: ["Casa Kilicé", "კოსმეტიკა", "ნათების წვეთი", "ტონალური კრემი", "საქართველო"],
  openGraph: {
    title: "Casa Kilicé — კრემისებრი ნათების წვეთი",
    description: "რამდენიმე წვეთი ნებისმიერ ტონალურში. ანათებს და ატენიანებს, ტონს არ ცვლის.",
    type: "website",
    locale: "ka_GE",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Casa Kilicé" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa Kilicé — კრემისებრი ნათების წვეთი",
    description: "რამდენიმე წვეთი ნებისმიერ ტონალურში. ანათებს და ატენიანებს, ტონს არ ცვლის.",
    images: ["/og.svg"],
  },
};

const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Casa Kilicé",
      ...(siteOrigin ? { url: siteOrigin } : {}),
      description: "კოსმეტიკის სახლი საქართველოსთვის. პირველი პროდუქტი კრემისებრი ნათების წვეთია.",
    },
    {
      "@type": "Product",
      name: "კრემისებრი ნათების წვეთი",
      brand: "Casa Kilicé",
      description:
        "კრემისებრი წვეთი, რომელიც ერევა ნებისმიერ ტონალურ კრემში, ანათებს და ატენიანებს სახეს. ფასი ჯერ არ არის გამოცხადებული.",
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieLocale = (await cookies()).get(LOCALE_STORAGE)?.value;
  const initialLocale: Locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale) ? (cookieLocale as Locale) : "en";

  return (
    <html
      lang="ka"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} ${georgian.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- global SEO graph
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <GoogleAnalytics />
        <Providers initialLocale={initialLocale}>
          <VisitorTracker />
          <CartProvider>
            <div className="flex min-h-full flex-col bg-[#f7f1e8] font-[family-name:var(--font-georgian)] text-[#2c241e]">
              <BrandHeader />
              <main className="relative z-10 flex-1 overflow-x-hidden">
                <MainSegmentErrorBoundary>{children}</MainSegmentErrorBoundary>
              </main>
              <BrandFooter />
            </div>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
