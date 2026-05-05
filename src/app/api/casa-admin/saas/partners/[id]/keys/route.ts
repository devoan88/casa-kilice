import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { generateSaasApiKey } from "@/lib/saas/apiKeyCrypto";

export const runtime = "nodejs";

const bodySchema = z.object({
  label: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: partnerId } = await ctx.params;
  const partner = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { rawKey, lookupHash, keyPrefix } = generateSaasApiKey();
  const row = await prisma.saasApiKey.create({
    data: {
      partnerId,
      lookupHash,
      keyPrefix,
      label: parsed.data.label || null,
    },
  });

  return NextResponse.json({
    apiKey: rawKey,
    id: row.id,
    keyPrefix: row.keyPrefix,
    message: "Store this key securely — it will not be shown again.",
  });
}
