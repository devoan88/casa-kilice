import type { Metadata } from "next";

import { MuseJoinClient } from "@/components/muse/MuseJoinClient";

export const metadata: Metadata = {
  title: "Join Casa Kilicé Muse",
  description: "Secure Muse registration — marketing consent and age-verified creator access.",
};

export default function MuseJoinPage() {
  return <MuseJoinClient />;
}
