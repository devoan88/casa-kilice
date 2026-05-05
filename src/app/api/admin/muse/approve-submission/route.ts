import { NextResponse } from "next/server";
import { z } from "zod";

import { approveContentSubmission } from "@/lib/muse/approveSubmission";

const bodySchema = z.object({
  submissionId: z.string().min(10).max(128),
});

/**
 * Server-only approval hook. Set `CK_ADMIN_MUSE_TOKEN` and send:
 * `Authorization: Bearer <token>` with JSON `{ "submissionId": "..." }`.
 */
export async function POST(req: Request) {
  const secret = process.env.CK_ADMIN_MUSE_TOKEN;
  if (!secret?.length) {
    return NextResponse.json({ ok: false as const, error: "NOT_CONFIGURED" }, { status: 503 });
  }

  const auth = req.headers.get("authorization")?.trim();
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token || token !== secret) {
    return NextResponse.json({ ok: false as const, error: "Unauthorized." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  const result = await approveContentSubmission(parsed.data.submissionId);
  if (!result.ok) {
    return NextResponse.json({ ok: false as const, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true as const });
}
