import Parser from "rss-parser";
import { unstable_cache } from "next/cache";

import { normalizeJournalImageUrl } from "@/lib/journal/imageUrl";
import { JOURNAL_SOURCES } from "@/lib/journal/sources";
import { buildJuicyPreview, extractImageFromItem } from "@/lib/journal/text";
import type { JournalArticle, JournalSourceId } from "@/lib/journal/types";

const UA = "CasaKiliceJournal/1.0 (+https://casakilice.com; editorial RSS reader)";
/** Per-feed HTTP timeout — keep low so /journal SSR cannot hang the dev server for a minute. */
const FETCH_MS = 7_000;
/** Hard cap for the whole RSS merge (all sources in parallel). */
const JOURNAL_TOTAL_BUDGET_MS = 12_000;

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  description?: string;
  content?: string;
  contentSnippet?: string;
  "content:encoded"?: string;
  enclosure?: { url?: string; type?: string };
  guid?: string;
  "media:thumbnail"?: unknown;
};

async function fetchXml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function parseItem(
  item: RssItem,
  sourceId: JournalSourceId,
  sourceLabel: string,
  sourceHomeUrl: string,
): JournalArticle | null {
  const title = item.title?.trim();
  const link = item.link?.trim();
  if (!title || !link) return null;
  const raw =
    item["content:encoded"] && typeof item["content:encoded"] === "string"
      ? item["content:encoded"]
      : item.content ?? item.contentSnippet ?? item.description ?? "";
  const snippet = buildJuicyPreview(raw, 300);
  const pub = item.isoDate ?? item.pubDate;
  const pubDate = pub ? new Date(pub) : new Date();
  if (Number.isNaN(pubDate.getTime())) return null;
  const id = `${sourceId}:${item.guid ?? link}`.slice(0, 240);
  const rawImage = extractImageFromItem(
    item.description ?? "",
    item.content,
    item.enclosure?.url,
    item.enclosure?.type,
    item["media:thumbnail"],
  );
  const imageUrl = normalizeJournalImageUrl(rawImage, link, sourceHomeUrl);
  return {
    id,
    title,
    link,
    sourceId,
    sourceLabel,
    sourceHomeUrl,
    imageUrl,
    snippet,
    pubDate,
    isDailyEdit: false,
  };
}

async function parseFeedXml(
  xml: string,
  sourceId: JournalSourceId,
  sourceLabel: string,
  sourceHomeUrl: string,
): Promise<JournalArticle[]> {
  try {
    const parser = new Parser({ customFields: { item: ["media:thumbnail", "content:encoded"] } });
    const feed = await parser.parseString(xml);
    const out: JournalArticle[] = [];
    for (const raw of feed.items ?? []) {
      const row = parseItem(raw as RssItem, sourceId, sourceLabel, sourceHomeUrl);
      if (row) out.push(row);
    }
    return out;
  } catch {
    return [];
  }
}

function applyDailyEdit(articles: JournalArticle[]): JournalArticle[] {
  const cutoff = startOfUtcDay(new Date());
  const idx = articles.findIndex((a) => startOfUtcDay(a.pubDate) === cutoff);
  return articles.map((a, i) => ({
    ...a,
    isDailyEdit: idx !== -1 && i === idx,
  }));
}

async function loadSource(def: (typeof JOURNAL_SOURCES)[number]): Promise<JournalArticle[]> {
  const merged: JournalArticle[] = [];
  const seen = new Set<string>();
  for (const url of def.feedUrls) {
    const xml = await fetchXml(url);
    if (!xml) continue;
    try {
      const rows = await parseFeedXml(xml, def.id, def.label, def.homeUrl);
      for (const r of rows) {
        if (seen.has(r.link)) continue;
        seen.add(r.link);
        merged.push(r);
      }
    } catch {
      /* skip malformed feed */
    }
    if (merged.length >= 12) break;
  }
  return merged;
}

async function loadAllUncached(): Promise<JournalArticle[]> {
  try {
    const work = Promise.all(JOURNAL_SOURCES.map((s) => loadSource(s)));
    const buckets = await Promise.race([
      work,
      new Promise<JournalArticle[][]>((resolve) => {
        setTimeout(() => resolve([]), JOURNAL_TOTAL_BUDGET_MS);
      }),
    ]);
    const flat = buckets.flat();
    flat.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    const dedup = new Map<string, JournalArticle>();
    for (const a of flat) {
      if (!dedup.has(a.link)) dedup.set(a.link, a);
    }
    return applyDailyEdit([...dedup.values()].slice(0, 36));
  } catch (e) {
    console.error("[journal] loadAllUncached", e);
    return [];
  }
}

/**
 * `unstable_cache` persists via JSON; `Date` fields become strings on read.
 * Without this, `.toISOString()` / `.getTime()` throw at runtime.
 */
function reviveJournalArticleDates(rows: JournalArticle[]): JournalArticle[] {
  return rows.map((a) => {
    const raw = a.pubDate as unknown;
    const pubDate =
      raw instanceof Date && !Number.isNaN(raw.getTime())
        ? raw
        : (() => {
            const d = new Date(typeof raw === "string" || typeof raw === "number" ? raw : String(raw));
            return Number.isNaN(d.getTime()) ? new Date(0) : d;
          })();
    return { ...a, pubDate };
  });
}

const getJournalArticlesCached = unstable_cache(
  async () => loadAllUncached(),
  ["casa-journal-feed-v1"],
  { revalidate: 43_200 },
);

export async function getJournalArticles(): Promise<JournalArticle[]> {
  try {
    const rows = await getJournalArticlesCached();
    return reviveJournalArticleDates(rows);
  } catch (e) {
    console.error("[journal] getJournalArticles", e);
    return [];
  }
}
