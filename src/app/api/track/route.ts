import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sanitizeSingleLine } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Avoid 404 on GET (prefetch/extensions); tracking uses POST only. */
export async function GET() {
  return NextResponse.json({ ok: true, method: "POST" });
}

const bodySchema = z.object({
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
});

const ipapiSchema = z
  .object({
    error: z.boolean().optional(),
    country_name: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    region: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    latitude: z.union([z.number(), z.string()]).optional().nullable(),
    longitude: z.union([z.number(), z.string()]).optional().nullable(),
  })
  .passthrough();

function pickIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") ?? undefined;
}

async function geoLookup(ip?: string) {
  const isLocal =
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.");

  const url = isLocal ? "https://ipapi.co/json/" : `https://ipapi.co/${ip}/json/`;
  const ctrl = new AbortController();
  const geoTimer = setTimeout(() => ctrl.abort(), 6000);
  let res: Response | undefined;
  try {
    res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(geoTimer);
  }
  if (!res.ok) return null;
  const raw = await res.json().catch(() => null);
  const parsed = ipapiSchema.safeParse(raw);
  if (!parsed.success || parsed.data.error) return null;
  const json = parsed.data;

  const latitude =
    typeof json.latitude === "string" ? Number(json.latitude) : json.latitude;
  const longitude =
    typeof json.longitude === "string"
      ? Number(json.longitude)
      : json.longitude;

  return {
    country: json.country_name ?? json.country ?? null,
    region: json.region ?? null,
    city: json.city ?? null,
    latitude: typeof latitude === "number" && Number.isFinite(latitude) ? latitude : null,
    longitude:
      typeof longitude === "number" && Number.isFinite(longitude) ? longitude : null,
  };
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = pickIp(req);
  const ua = req.headers.get("user-agent") ?? undefined;

  const geo = await geoLookup(ip);

  const path = sanitizeSingleLine(parsed.data.path, 2048);
  const referrer = sanitizeSingleLine(parsed.data.referrer, 2048);

  try {
    await prisma.visit.create({
      data: {
        ip,
        country: geo?.country ?? undefined,
        region: geo?.region ?? undefined,
        city: geo?.city ?? undefined,
        latitude: geo?.latitude ?? undefined,
        longitude: geo?.longitude ?? undefined,
        path,
        referrer,
        userAgent: ua,
      },
    });
  } catch (e) {
    console.warn("[api/track] visit not persisted", e);
  }

  return NextResponse.json({ ok: true });
}

