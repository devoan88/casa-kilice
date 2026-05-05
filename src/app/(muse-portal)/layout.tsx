import type { ReactNode } from "react";

import { MusePortalErrorBoundary } from "@/components/muse/MusePortalErrorBoundary";

export default function MusePortalLayout({ children }: { children: ReactNode }) {
  return <MusePortalErrorBoundary>{children}</MusePortalErrorBoundary>;
}
