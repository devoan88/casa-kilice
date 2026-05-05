import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function mimeFromPath(p: string): string {
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const row = await prisma.consultation.findUnique({
    where: { id },
    select: { userPhotoUrl: true },
  });
  if (!row?.userPhotoUrl) {
    return new NextResponse(null, { status: 404 });
  }

  const abs = path.join(process.cwd(), "storage", row.userPhotoUrl);
  try {
    const buf = await readFile(abs);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": mimeFromPath(row.userPhotoUrl),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
