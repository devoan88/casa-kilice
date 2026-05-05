import { getJournalArticles } from "@/lib/journal/fetchJournal";
import type { JournalArticle } from "@/lib/journal/types";

import { shouldFetchJournalRss } from "@/lib/journal/rssPolicy";

/** Max items returned to the browser (light page). */
export const JOURNAL_PUBLIC_ITEM_CAP = 9;

/**
 * Safe entry for API routes: never throws; respects RSS policy; caps list length.
 */
export async function loadJournalArticlesForPublic(): Promise<JournalArticle[]> {
  if (!shouldFetchJournalRss()) return [];
  try {
    const rows = await getJournalArticles();
    return rows.slice(0, JOURNAL_PUBLIC_ITEM_CAP);
  } catch (e) {
    console.error("[journal] loadJournalArticlesForPublic", e);
    return [];
  }
}
