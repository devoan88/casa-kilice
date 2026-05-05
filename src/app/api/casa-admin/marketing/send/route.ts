import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { sendMarketingEmail } from "@/lib/mail";

const bodySchema = z.object({
  subject: z.string().trim().min(2).max(200),
  html: z.string().trim().min(10).max(100_000),
  recipients: z.array(z.string().trim().email()).min(1).max(50),
});

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid payload." }, { status: 400 });
  }

  const { subject, html, recipients } = parsed.data;
  const results: { to: string; ok: boolean; error?: string }[] = [];

  for (const to of recipients) {
    const r = await sendMarketingEmail({ to, subject, html });
    results.push({ to, ok: r.ok, error: r.error });
  }

  const okCount = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true as const, sent: okCount, total: recipients.length, results });
}
