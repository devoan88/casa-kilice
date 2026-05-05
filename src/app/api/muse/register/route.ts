import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { parseBirthDateInput, validateMuseBirthDate } from "@/lib/muse/birthDate";
import { MUSE_REGISTRATION_BONUS } from "@/lib/muse/points";
import { applyMuseRewardsAfterPointChange } from "@/lib/muse/tierAutomation";
import { passwordPolicySchema } from "@/lib/security/passwordPolicy";
import { sanitizeEmail, sanitizePlainText } from "@/lib/security/sanitize";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email(),
  password: passwordPolicySchema,
  instagramHandle: z.string().trim().min(1, "Instagram handle is required.").max(200),
  tiktokHandle: z.string().trim().min(1, "TikTok handle is required.").max(200),
  followerCountRange: z.enum(["<5k", "5k-20k", "20k-50k", "50k+"]),
  birthDate: z.string().min(8).max(32),
  marketingConsent: z.literal(true),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ ok: false as const, error: msg }, { status: 400 });
  }

  const { followerCountRange, birthDate } = parsed.data;
  const name = sanitizePlainText(parsed.data.name, 120);
  const normalizedEmail = sanitizeEmail(parsed.data.email);
  const password = parsed.data.password;
  const instagramHandle = sanitizePlainText(parsed.data.instagramHandle, 200);
  const tiktokHandle = sanitizePlainText(parsed.data.tiktokHandle, 200);

  const birth = parseBirthDateInput(birthDate);
  if (!birth) {
    return NextResponse.json({ ok: false as const, error: "Invalid date of birth." }, { status: 400 });
  }
  const ageCheck = validateMuseBirthDate(birth);
  if (!ageCheck.ok) {
    return NextResponse.json({ ok: false as const, error: ageCheck.error }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { ok: false as const, error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  try {
    const created = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        birthDate: birth,
        instagramHandle: instagramHandle.trim(),
        tiktokHandle: tiktokHandle.trim(),
        followerCountRange,
        points: MUSE_REGISTRATION_BONUS,
        isMuse: true,
        museMarketingConsent: true,
        museMarketingConsentAt: now,
      },
      select: { id: true, points: true },
    });
    await applyMuseRewardsAfterPointChange(created.id, 0, created.points);
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? (e as { code?: string }).code : undefined;
    if (code === "P2002") {
      return NextResponse.json(
        { ok: false as const, error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error("[muse/register]", e);
    return NextResponse.json({ ok: false as const, error: "Registration failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true as const });
}
