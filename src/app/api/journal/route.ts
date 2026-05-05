import { NextResponse } from "next/server";

import { loadJournalArticlesForPublic } from "@/lib/journal/loadFeedSafe";
import type { JournalArticle, JournalArticleDTO } from "@/lib/journal/types";

export const dynamic = "force-dynamic";

function serialize(rows: JournalArticle[]): JournalArticleDTO[] {
  return rows.map((a) => {
    const d = a.pubDate instanceof Date ? a.pubDate : new Date(a.pubDate as unknown as string);
    const pubDate = Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
    return { ...a, pubDate };
  });
}

/** GET /api/journal — safe JSON for client-side fetch (one shot per tab via useEffect []). */
export async function GET() {
  try {
    const rows = await loadJournalArticlesForPublic();
    return NextResponse.json({
      ok: true as const,
      articles: serialize(rows),
    });
  } catch (e) {
    console.error("[api/journal]", e);
    return NextResponse.json(
      { ok: false as const, articles: [] as JournalArticleDTO[], message: "FETCH_FAILED" },
      { status: 200 },
    );
  }
}
