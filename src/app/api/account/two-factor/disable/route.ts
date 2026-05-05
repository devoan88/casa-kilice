import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptTwoFactorSecret } from "@/lib/security/twoFactorCrypto";
import { verifyTotpToken } from "@/lib/twoFactor/otp";

export const runtime = "nodejs";

const bodySchema = z.object({
  password: z.string().min(8).max(512),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isTwoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user?.passwordHash || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "Two-factor authentication is not enabled." }, { status: 400 });
  }

  const pwOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!pwOk) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  let plainSecret: string;
  try {
    plainSecret = decryptTwoFactorSecret(user.twoFactorSecret);
  } catch {
    return NextResponse.json({ error: "Could not verify authenticator." }, { status: 500 });
  }

  if (!verifyTotpToken(plainSecret, parsed.data.code)) {
    return NextResponse.json({ error: "Incorrect authenticator code." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isTwoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return NextResponse.json({ ok: true as const });
}
