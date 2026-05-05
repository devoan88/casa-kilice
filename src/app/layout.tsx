import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Inter, Noto_Serif_Georgian } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";

import { Providers } from "@/components/Providers";
import { CartProvider } from "@/components/cart/CartProvider";
import { MoodProvider } from "@/components/future/MoodProvider";
import { MoodOverlay } from "@/components/future/MoodOverlay";
import { MoodSelector } from "@/components/future/MoodSelector";
import { VoiceRing } from "@/components/future/VoiceRing";
import { BreatheGlowIntro } from "@/components/future/BreatheGlowIntro";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { QuietHeader } from "@/components/quiet/QuietHeader";
import { QuietFooter } from "@/components/quiet/QuietFooter";
import { QuietFooterSecondaryNav } from "@/components/quiet/QuietFooterSecondaryNav";
import { MainSegmentErrorBoundary } from "@/components/safety/MainSegmentErrorBoundary";
import { VisitorTracker } from "@/components/VisitorTracker";
import { DigitalAtmosphere } from "@/components/portal/DigitalAtmosphere";
import { VisionGlow } from "@/components/portal/VisionGlow";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LOCALE_STORAGE, LOCALES, type Locale } from "@/i18n/types";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Casa Kilicé - The World's First AI Skin Innovation",
    template: "%s · Casa Kilicé",
  },
  description:
    "Ultra-modern Skin Scan (სკინ სკანირება): vision analysis, wellness passport, Casa Kilicé rituals, and partner API from $49 / $149 / $499 — quiet luxury cosmetics.",
  keywords: [
    "AI Skin Scan",
    "Personalized Vitamin Guide",
    "Virtual Makeup Artist API",
    "Skin Health Algorithm",
    "Casa Kilicé",
    "AI wellness",
  ],
  openGraph: {
    title: "Casa Kilicé - The World's First AI Skin Innovation",
    description:
      "Vision-guided skin analysis, holistic wellness modules, and partner API — Casa Kilicé.",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Casa Kilicé - The World's First AI Skin Innovation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa Kilicé - The World's First AI Skin Innovation",
    description:
      "Vision-guided skin analysis, holistic wellness modules, and partner API — Casa Kilicé.",
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
      description:
        "Luxury cosmetics maison with AI-powered skin scan (სკინ სკანირება), digital wellness passport, and B2B wellness API.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Casa Kilicé Skin Scan",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description:
        "Vision AI for undertone, gender-aware protocols, wellness passport (vitamins, sleep, lifestyle), and Casa Kilicé ritual mapping.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Consumer scan; partner API billed separately.",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let showAdminFooterLink = false;
  const isStaticPreview =
    process.env.DEPLOY_TARGET === "github-pages" && process.env.VERCEL !== "1";
  if (!isStaticPreview) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const row = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        showAdminFooterLink = row?.role === "ADMIN";
      }
    } catch {
      showAdminFooterLink = false;
    }
  }

  const cookieLocale = (await cookies()).get(LOCALE_STORAGE)?.value;
  const initialLocale: Locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale) ? (cookieLocale as Locale) : "en";

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-ck-era="2030"
      className={`${sans.variable} ${display.variable} ${georgian.variable} lang-en h-full scroll-smooth`}
    >
      <body className="min-h-full overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- global SEO graph
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <DigitalAtmosphere />
        <VisionGlow />
        <div className="ck-site-grain pointer-events-none fixed inset-0 z-[1]" aria-hidden />
        <GoogleAnalytics />
        <Providers initialLocale={initialLocale}>
          <VisitorTracker />
          <MoodProvider>
            {/* Full-screen intro caused Strict Mode / storage edge cases in dev; keep for production only. */}
            {process.env.NODE_ENV === "production" ? <BreatheGlowIntro /> : null}
            <MoodOverlay />
            <CartProvider>
              <div className="flex min-h-full flex-col">
                <QuietHeader />
                <main className="relative z-10 flex-1 overflow-x-hidden">
                  <MainSegmentErrorBoundary>{children}</MainSegmentErrorBoundary>
                </main>
                <QuietFooter showAdminFooterLink={showAdminFooterLink}>
                  <QuietFooterSecondaryNav />
                </QuietFooter>
              </div>
            </CartProvider>
            <MoodSelector />
            <VoiceRing />
          </MoodProvider>
        </Providers>
      </body>
    </html>
  );
}
