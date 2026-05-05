export type JournalSourceId = "vogue" | "lofficiel" | "harpers";

export type JournalArticle = {
  id: string;
  title: string;
  link: string;
  sourceId: JournalSourceId;
  sourceLabel: string;
  /** Publication home for attribution (not the individual article URL). */
  sourceHomeUrl: string;
  imageUrl?: string;
  snippet: string;
  pubDate: Date;
  isDailyEdit: boolean;
};

/** JSON shape for `/api/journal` and the Journal client. */
export type JournalArticleDTO = Omit<JournalArticle, "pubDate"> & { pubDate: string };
