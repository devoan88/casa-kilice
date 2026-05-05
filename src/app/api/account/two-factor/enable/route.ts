import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptTwoFactorSecret } from "@/lib/security/twoFactorCrypto";
import { verifyTotpToken } from "@/lib/twoFactor/otp";

export const runtime = "nodejs";

const bodySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
  secret: z.string().min(16).max(64),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code or secret." }, { status: 400 });
  }

  const { code, secret } = parsed.data;
  if (!verifyTotpToken(secret, code)) {
    return NextResponse.json({ error: "Incorrect code. Try again." }, { status: 400 });
  }

  let encrypted: string;
  try {
    encrypted = encryptTwoFactorSecret(secret);
  } catch (e) {
    console.error("[2fa/enable] encryption", e);
    return NextResponse.json(
      { error: "Server is not configured for 2FA (missing TWO_FACTOR_ENCRYPTION_KEY)." },
      { status: 500 },
    );
  }

  await prisma.user.update({
    where: { email },
    data: {
      twoFactorSecret: encrypted,
      isTwoFactorEnabled: true,
    },
  });

  return NextResponse.json({ ok: true as const });
}
