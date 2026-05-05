type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const anonBuckets = new Map<string, Bucket>();
const badKeyBuckets = new Map<string, Bucket>();
const partnerBuckets = new Map<string, Bucket>();

function prune(map: Map<string, Bucket>) {
  if (map.size < 4000) return;
  const now = Date.now();
  for (const [k, b] of map) {
    if (now > b.resetAt) map.delete(k);
  }
}

function take(map: Map<string, Bucket>, key: string, max: number): boolean {
  const now = Date.now();
  let b = map.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    map.set(key, b);
  }
  if (b.count >= max) return false;
  b.count += 1;
  prune(map);
  return true;
}

export function clientIpFromRequest(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

/** No API key supplied — default 5/min per IP. */
export function takeV1AnonymousSlot(req: Request): boolean {
  const max = Number(process.env.SAAS_RATE_ANON_RPM ?? "5");
  const lim = Number.isFinite(max) && max > 0 ? Math.floor(max) : 5;
  return take(anonBuckets, `anon:${clientIpFromRequest(req)}`, lim);
}

/** Invalid / revoked key — same tight limit per IP. */
export function takeV1BadKeySlot(req: Request): boolean {
  const max = Number(process.env.SAAS_RATE_ANON_RPM ?? "5");
  const lim = Number.isFinite(max) && max > 0 ? Math.floor(max) : 5;
  return take(badKeyBuckets, `bad:${clientIpFromRequest(req)}`, lim);
}

/** Valid key — limit by partner + tier (calls per minute). */
export function takeV1PartnerSlot(partnerId: string, maxPerMinute: number): boolean {
  const lim = Math.max(1, Math.min(10_000, maxPerMinute));
  return take(partnerBuckets, `p:${partnerId}`, lim);
}
