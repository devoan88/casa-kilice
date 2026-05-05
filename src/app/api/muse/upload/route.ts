import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { labelFromFileUrl } from "@/lib/muse/fileLabel";
import { musePendingUserDir } from "@/lib/muse/storagePaths";
import { MUSE_UPLOAD_MAX_BYTES, museSubmissionDbType } from "@/lib/muse/uploadMime";
import { prisma } from "@/lib/prisma";

function safeBasename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-()+ ]/g, "_").slice(0, 120);
  return base.length ? base : "upload.bin";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false as const, error: "Unauthorized." }, { status: 401 });
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

  const userId = session.user.id;
  const originalName = safeBasename(file.name);
  const ext = path.extname(originalName) || (dbType === "Photo" ? ".jpg" : ".mp4");
  const fileId = crypto.randomUUID();
  const storageFileName = `${fileId}${ext}`;
  const fileUrl = path.join(userId, storageFileName).replace(/\\/g, "/");

  const dir = musePendingUserDir(userId);
  await mkdir(dir, { recursive: true });
  const absPath = path.join(dir, storageFileName);
  await writeFile(absPath, buf);

  const row = await prisma.contentSubmission.create({
    data: {
      userId,
      status: "Pending",
      type: dbType,
      fileUrl,
      pointsAwarded: 0,
    },
  });

  return NextResponse.json({
    ok: true as const,
    upload: {
      id: row.id,
      status: row.status,
      type: row.type,
      fileUrl: row.fileUrl,
      displayName: labelFromFileUrl(row.fileUrl),
      pointsAwarded: row.pointsAwarded,
      createdAt: row.createdAt.toISOString(),
    },
  });
}
