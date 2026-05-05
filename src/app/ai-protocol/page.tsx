import type { Metadata } from "next";

import { AiProtocolClient } from "./AiProtocolClient";

export const metadata: Metadata = {
  title: "Skin Scan — Casa Kilicé · Digital Beauty Passport",
  description:
    "Ultra-modern AI skin scanning: vision analysis, colour season, wellness protocol, Casa Kilicé rituals — unique house innovation. Export a luxury protocol PDF.",
  keywords: [
    "AI skin scan",
    "Claude vision skin analysis",
    "digital beauty passport",
    "Casa Kilicé",
    "colour season analysis",
    "AI wellness",
    "personalized SPF",
  ],
  openGraph: {
    title: "Skin Scan — Casa Kilicé",
    description: "World-class AI skin intelligence and digital passport — not a medical diagnosis.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Casa Kilicé Skin Scan",
      alternateName: ["სკინ სკანირება", "Kilicé AI Protocol"],
      description:
        "Vision-based AI skin and style analysis: undertone, depth, gender-aware grooming or beauty routing, colour season, wellness education, and Casa Kilicé product mapping. Educational only; not a medical diagnosis.",
      provider: { "@type": "Organization", name: "Casa Kilicé" },
      serviceType: "AI-assisted cosmetic skin consultation",
      category: "BeautyAndWellness",
      areaServed: "Worldwide",
      isRelatedTo: {
        "@type": "Product",
        name: "Casa Kilicé cosmetics",
        brand: { "@type": "Brand", name: "Casa Kilicé" },
      },
      offers: {
        "@type": "Offer",
        description: "Digital Beauty Passport with optional PDF export for signed-in clients.",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Casa Kilicé Skin Scan Engine",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Consumer skin scan on casakilice.com; B2B API available on subscription.",
      },
    },
  ],
};

export default function AiProtocolPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- SEO structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative min-h-[calc(100vh-6rem)] bg-[radial-gradient(ellipse_120%_70%_at_50%_-10%,#1e1a17_0%,#0a0908_42%,#050403_100%)] pb-8 text-[color:var(--sand-soft)]">
        <AiProtocolClient />
      </div>
    </>
  );
}
