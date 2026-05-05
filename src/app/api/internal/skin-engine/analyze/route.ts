import { NextResponse } from "next/server";

import { runSkinAnalysisPipeline } from "@/lib/skinScan/runPipeline";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Protected analysis worker. Intended for a private deployment or same-origin
 * call when `SKIN_ENGINE_URL` points here. Never expose without network + secret hardening.
 */
export async function POST(req: Request) {
  const secret = process.env.SKIN_ENGINE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "SKIN_ENGINE_SECRET not configured." }, { status: 501 });
  }
  const got = req.headers.get("x-skin-engine-secret")?.trim();
  if (got !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    imageBase64?: string;
    mimeType?: string;
    skinFocus?: string | null;
    mood?: string | null;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let photoBuf: Buffer | null = null;
  let photoMime: string | null = null;
  if (body.imageBase64) {
    try {
      photoBuf = Buffer.from(body.imageBase64, "base64");
    } catch {
      return NextResponse.json({ error: "Invalid imageBase64." }, { status: 400 });
    }
    const mime = (body.mimeType || "image/jpeg").toLowerCase();
    if (!ALLOWED.has(mime)) {
      return NextResponse.json({ error: "Invalid mimeType." }, { status: 400 });
    }
    photoMime = mime;
  }

  try {
    // When this route is the engine URL itself, avoid infinite loop: no SKIN_ENGINE_URL in this process.
    const { payload, aiRecommendation, source } = await runSkinAnalysisPipeline({
      photoBuf,
      photoMime,
      skinFocus: body.skinFocus ?? null,
      mood: body.mood ?? null,
    });
    return NextResponse.json({ payload, aiRecommendation, source });
  } catch (e) {
    console.error("[internal/skin-engine]", e);
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
