import type { Metadata } from "next";

import { JournalPageClient } from "@/components/journal/JournalPageClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Casa Kilicé Journal",
  description:
    "Curated fashion and beauty dispatches from Vogue, L'Officiel, and Harper's Bazaar — the Casa Kilicé house edit.",
};

/** RSS is loaded client-side once per tab (see `JournalPageClient` + `/api/journal`) for stability. */
export default function JournalPage() {
  return <JournalPageClient />;
}
