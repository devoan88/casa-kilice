import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { creatorUgcCreatorDir, creatorUgcRootDir } from "@/lib/creator/storagePaths";
import { MUSE_UPLOAD_MAX_BYTES, museSubmissionDbType } from "@/lib/muse/uploadMime";
import { prisma } from "@/lib/prisma";

function safeBasename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-()+ ]/g, "_").slice(0, 120);
  return base.length ? base : "upload.bin";
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id: creatorId } = await ctx.params;
  const creator = await prisma.creator.findUnique({ where: { id: creatorId }, select: { id: true } });
  if (!creator) {
    return NextResponse.json({ ok: false as const, error: "Creator not found." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false as const, error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false as const, error: "Missing file." }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const dbType = museSubmissionDbType(mime);
  if (!dbType) {
    return NextResponse.json(
      { ok: false as const, error: "Only common image or video formats are accepted." },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MUSE_UPLOAD_MAX_BYTES) {
    return NextResponse.json(
      { ok: false as const, error: "File is empty or too large (max 45 MB)." },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const originalName = safeBasename(file.name);
  const ext = path.extname(originalName) || (dbType === "Photo" ? ".jpg" : ".mp4");
  const fileId = crypto.randomUUID();
  const storageFileName = `${fileId}${ext}`;
  const fileUrl = path.join(creatorId, storageFileName).replace(/\\/g, "/");

  const dir = creatorUgcCreatorDir(creatorId);
  await mkdir(dir, { recursive: true });
  const absPath = path.join(creatorUgcRootDir(), fileUrl);
  await writeFile(absPath, buf);

  const row = await prisma.creatorMedia.create({
    data: {
      creatorId,
      fileUrl,
      type: dbType,
    },
  });

  revalidatePath("/casa-admin/creators");
  revalidatePath(`/casa-admin/creators/${creatorId}`);

  return NextResponse.json({
    ok: true as const,
    media: {
      id: row.id,
      fileUrl: row.fileUrl,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
    },
  });
}
