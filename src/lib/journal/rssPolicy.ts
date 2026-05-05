/**
 * Journal RSS is on by default in dev and production.
 * Set `CK_JOURNAL_RSS=0` in `.env.local` if feeds wedge Turbopack or you want a static Journal without outbound HTTP.
 */
export function shouldFetchJournalRss(): boolean {
  return process.env.CK_JOURNAL_RSS !== "0";
}
