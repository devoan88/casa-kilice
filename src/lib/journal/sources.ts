import type { JournalSourceId } from "@/lib/journal/types";

export type JournalFeedSource = {
  id: JournalSourceId;
  label: string;
  /** Public home URL for attribution when item link is broken. */
  homeUrl: string;
  feedUrls: string[];
};

/** Primary RSS endpoints; Harper’s tries US section feeds in order. */
export const JOURNAL_SOURCES: JournalFeedSource[] = [
  {
    id: "vogue",
    label: "Vogue",
    homeUrl: "https://www.vogue.com",
    feedUrls: ["https://www.vogue.com/feed/rss"],
  },
  {
    id: "lofficiel",
    label: "L'Officiel",
    homeUrl: "https://www.lofficielusa.com",
    feedUrls: ["https://www.lofficielusa.com/feed.rss"],
  },
  {
    id: "harpers",
    label: "Harper's Bazaar",
    homeUrl: "https://www.harpersbazaar.com",
    feedUrls: [
      "https://www.harpersbazaar.com/fashion/fashion-rss/",
      "https://www.harpersbazaar.com/beauty/beauty-rss/",
      "https://www.harpersbazaar.com/celebrity/celebrity-rss/",
      "https://www.harpersbazaar.com/culture/culture-rss/",
    ],
  },
];
