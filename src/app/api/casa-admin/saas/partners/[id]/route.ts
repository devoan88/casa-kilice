import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const patchSchema = z.object({
  apiAccessEnabled: z.boolean().optional(),
  allowedEmbedOrigins: z.string().trim().max(2000).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: partnerId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!existing) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const data: { apiAccessEnabled?: boolean; allowedEmbedOrigins?: string | null } = {};
  if (parsed.data.apiAccessEnabled !== undefined) data.apiAccessEnabled = parsed.data.apiAccessEnabled;
  if (parsed.data.allowedEmbedOrigins !== undefined) {
    data.allowedEmbedOrigins =
      parsed.data.allowedEmbedOrigins === null || parsed.data.allowedEmbedOrigins === ""
        ? null
        : parsed.data.allowedEmbedOrigins;
  }

  const partner = await prisma.saasPartner.update({
    where: { id: partnerId },
    data,
  });

  return NextResponse.json({ partner });
}
