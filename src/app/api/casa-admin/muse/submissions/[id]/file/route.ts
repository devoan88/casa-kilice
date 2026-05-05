import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { musePendingRootDir } from "@/lib/muse/storagePaths";
import { prisma } from "@/lib/prisma";

function mimeFromFilename(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  return "application/octet-stream";
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await ctx.params;
  const row = await prisma.contentSubmission.findUnique({
    where: { id },
    select: { fileUrl: true },
  });
  if (!row?.fileUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const root = path.resolve(musePendingRootDir());
  const resolved = path.resolve(path.join(root, row.fileUrl));
  const rootNorm = root.toLowerCase() + path.sep;
  const resNorm = resolved.toLowerCase();
  if (resNorm !== root.toLowerCase() && !resNorm.startsWith(rootNorm)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const buf = await readFile(resolved);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": mimeFromFilename(resolved),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
