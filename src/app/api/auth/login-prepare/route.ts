import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyLoginPrepare } from "@/lib/loginPrepare";
import { sanitizeEmail } from "@/lib/security/sanitize";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(512),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid request." }, { status: 400 });
  }

  const email = sanitizeEmail(parsed.data.email);
  const result = await verifyLoginPrepare(email, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json({ ok: false as const, error: "Invalid email or password." }, { status: 401 });
  }

  if (result.needsTwoFactor) {
    return NextResponse.json({
      ok: true as const,
      needsTwoFactor: true as const,
      preLoginToken: result.preLoginToken,
      email,
    });
  }

  return NextResponse.json({ ok: true as const, needsTwoFactor: false as const, email });
}
