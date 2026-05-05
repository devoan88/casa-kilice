import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizePlainText } from "@/lib/security/sanitize";

const patchSchema = z.object({
  preferredName: z.union([z.string().max(120), z.null()]).optional(),
  skinFocus: z.union([z.string().max(2000), z.null()]).optional(),
  lastRecommendedId: z.union([z.string().max(64), z.null()]).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.conciergeProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    preferredName: profile?.preferredName ?? user.name ?? null,
    skinFocus: profile?.skinFocus ?? null,
    lastRecommendedId: profile?.lastRecommendedId ?? null,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const body = parsed.data;

  const preferredName =
    body.preferredName === null
      ? null
      : body.preferredName === undefined
        ? undefined
        : sanitizePlainText(body.preferredName, 120);
  const skinFocus =
    body.skinFocus === null
      ? null
      : body.skinFocus === undefined
        ? undefined
        : sanitizePlainText(body.skinFocus, 2000);
  const lastRecommendedId =
    body.lastRecommendedId === null
      ? null
      : body.lastRecommendedId === undefined
        ? undefined
        : sanitizePlainText(body.lastRecommendedId, 64);

  const profile = await prisma.conciergeProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      preferredName: preferredName ?? undefined,
      skinFocus: skinFocus ?? undefined,
      lastRecommendedId: lastRecommendedId ?? undefined,
    },
    update: {
      preferredName: preferredName ?? undefined,
      skinFocus: skinFocus ?? undefined,
      lastRecommendedId: lastRecommendedId ?? undefined,
    },
  });

  return NextResponse.json({
    preferredName: profile.preferredName ?? null,
    skinFocus: profile.skinFocus ?? null,
    lastRecommendedId: profile.lastRecommendedId ?? null,
  });
}

