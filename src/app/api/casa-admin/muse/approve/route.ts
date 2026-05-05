import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { approveContentSubmission } from "@/lib/muse/approveSubmission";

const bodySchema = z.object({
  submissionId: z.string().min(10).max(128),
});

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
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
