import { Suspense } from "react";

import { SkinEmbedWidget } from "@/components/skin-api/SkinEmbedWidget";

export default function EmbedSkinAnalysisPage() {
  return (
    <div className="flex min-h-[40vh] items-start justify-center bg-transparent p-2">
      <Suspense fallback={<p className="p-4 text-xs text-muted">Loading embed…</p>}>
        <SkinEmbedWidget />
      </Suspense>
    </div>
  );
}
