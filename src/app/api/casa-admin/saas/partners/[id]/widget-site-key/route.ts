import { NextResponse } from "next/server";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { newWidgetSiteKey } from "@/lib/saas/widgetSiteKey";

export const runtime = "nodejs";

/** Issue or rotate the public widget site key (`data-site-key` on /casa-skin-widget.js). */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: partnerId } = await ctx.params;
  const partner = await prisma.saasPartner.findUnique({ where: { id: partnerId } });
  if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const widgetSiteKey = newWidgetSiteKey();
  await prisma.saasPartner.update({
    where: { id: partnerId },
    data: { widgetSiteKey },
  });

  return NextResponse.json({ widgetSiteKey });
}
