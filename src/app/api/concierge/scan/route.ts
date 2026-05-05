import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { skinScanRelativePath, skinScanUserDir } from "@/lib/skinScan/storagePaths";
import { invokeSkinAnalysisEngine } from "@/lib/skinScan/engineInvoker";

export const runtime = "nodejs";

const MAX_BYTES = 9 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_SKIN_FOCUS = new Set(["glow", "hydration", "tone"]);
const MAX_TAG_LEN = 48;

function extForMime(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

async function persistPhoto(userId: string, buf: Buffer, mime: string): Promise<string> {
  const id = crypto.randomUUID();
  const ext = extForMime(mime);
  const fileName = `${id}${ext}`;
  const dir = skinScanUserDir(userId);
  await mkdir(dir, { recursive: true });
  const abs = path.join(dir, fileName);
  await writeFile(abs, buf);
  return skinScanRelativePath(userId, fileName);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ct = req.headers.get("content-type") ?? "";
  let mood: string | null = null;
  let skinFocus: string | null = null;
  let photoBuf: Buffer | null = null;
  let photoMime: string | null = null;
  let relativePath: string | null = null;

  if (ct.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    mood = (form.get("mood") as string | null)?.trim() || null;
    skinFocus = (form.get("skinFocus") as string | null)?.trim() || null;
    const file = form.get("photo");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Photo too large (max 9 MB)." }, { status: 400 });
      }
      const mime = (file.type || "application/octet-stream").toLowerCase();
      if (!ALLOWED.has(mime)) {
        return NextResponse.json({ error: "Use JPG, PNG, or WebP." }, { status: 400 });
      }
      photoBuf = Buffer.from(await file.arrayBuffer());
      photoMime = mime;
      relativePath = await persistPhoto(user.id, photoBuf, mime);
    }
  } else {
    const body = (await req.json().catch(() => null)) as
      | { mood?: string; skinFocus?: string | null }
      | null;
    if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    mood = body.mood ?? null;
    skinFocus = body.skinFocus ?? null;
  }

  // Input hardening: allow only short, safe tags.
  if (mood) {
    mood = mood.replace(/[^\p{L}\p{N}\s\-_.]/gu, "").trim().slice(0, MAX_TAG_LEN) || null;
  }
  if (skinFocus) {
    const cleaned = skinFocus.replace(/[^\p{L}\p{N}\s\-_.]/gu, "").trim().slice(0, MAX_TAG_LEN);
    skinFocus = ALLOWED_SKIN_FOCUS.has(cleaned) ? cleaned : null;
  }

  const { payload, aiRecommendation, source } = await invokeSkinAnalysisEngine({
    photoBuf,
    photoMime,
    skinFocus,
    mood,
  });

  const consultation = await prisma.consultation.create({
    data: {
      userId: user.id,
      userPhotoUrl: relativePath,
      analysisResult: JSON.stringify(payload),
      aiRecommendation,
      primaryProductSlug: payload.primaryProductSlug,
    },
  });

  await prisma.conciergeProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      skinFocus: skinFocus ?? undefined,
      lastRecommendedId: payload.primaryProductSlug,
    },
    update: {
      skinFocus: skinFocus ?? undefined,
      lastRecommendedId: payload.primaryProductSlug,
    },
  });

  return NextResponse.json({
    recommendedId: payload.primaryProductSlug,
    undertone: payload.undertone,
    depth: payload.depth,
    routineHints: payload.routineHints,
    aiRecommendation,
    analysisSource: source,
    consultationId: consultation.id,
    wellness: payload.wellness,
    styling: payload.styling,
    medicalDisclaimerKa: payload.medicalDisclaimerKa,
    medicalDisclaimerEn: payload.medicalDisclaimerEn,
  });
}
