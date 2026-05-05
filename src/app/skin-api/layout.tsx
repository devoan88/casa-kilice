import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skin Analysis API — Casa Kilicé",
  description:
    "Beauty Tech B2B: prepaid skin analysis credits, REST API and iframe widget, with Stripe or IBAN-backed settlement.",
};

export default function SkinApiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
