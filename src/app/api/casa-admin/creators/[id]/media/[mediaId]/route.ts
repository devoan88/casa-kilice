import { unlink } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { creatorUgcRootDir } from "@/lib/creator/storagePaths";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string; mediaId: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id: creatorId, mediaId } = await ctx.params;
  const row = await prisma.creatorMedia.findFirst({
    where: { id: mediaId, creatorId },
    select: { id: true, fileUrl: true },
  });
  if (!row) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  const root = path.resolve(creatorUgcRootDir());
  const abs = path.resolve(path.join(root, row.fileUrl));
  const rootNorm = root.toLowerCase() + path.sep;
  const absNorm = abs.toLowerCase();
  if (absNorm === root.toLowerCase() || absNorm.startsWith(rootNorm)) {
    try {
      await unlink(abs);
    } catch {
      /* ignore */
    }
  }

  await prisma.creatorMedia.delete({ where: { id: row.id } });
  revalidatePath("/casa-admin/creators");
  revalidatePath(`/casa-admin/creators/${creatorId}`);
  return NextResponse.json({ ok: true as const });
}
