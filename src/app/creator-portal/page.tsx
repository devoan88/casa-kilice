import type { Metadata } from "next";

import { CreatorMusePortalClient } from "@/components/creator/CreatorMusePortalClient";

export const metadata: Metadata = {
  title: "CASA KILICÉ MUSE — Creator portal",
  description: "Creator ecosystem — rewards, UGC, and analytics foundation for Casa Kilicé.",
};

export default function CreatorPortalPage() {
  return <CreatorMusePortalClient />;
}
