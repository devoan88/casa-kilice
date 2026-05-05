import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { createPreLoginToken } from "@/lib/security/preLoginToken";

function timingSafeStringEqual(a: string, b: string): boolean {
  const tag = "casa-credentials";
  const digest = (s: string) => crypto.createHmac("sha256", tag).update(s).digest();
  try {
    return crypto.timingSafeEqual(digest(a), digest(b));
  } catch {
    return false;
  }
}

export type LoginPrepareOk =
  | { ok: true; needsTwoFactor: false; userId?: string }
  | { ok: true; needsTwoFactor: true; userId: string; preLoginToken: string };

export type LoginPrepareResult = { ok: false; reason: "invalid" } | LoginPrepareOk;

/**
 * First login step: validate password. Used before NextAuth when 2FA may be required.
 */
export async function verifyLoginPrepare(emailRaw: string, password: string): Promise<LoginPrepareResult> {
  const email = emailRaw.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const adminPasswordPlain = process.env.ADMIN_PASSWORD?.trim();

  if (adminEmail && email === adminEmail) {
    let adminOk = false;
    if (adminPasswordHash) {
      adminOk = await bcrypt.compare(password, adminPasswordHash);
    } else if (adminPasswordPlain) {
      adminOk = timingSafeStringEqual(password, adminPasswordPlain);
    }
    if (!adminOk) return { ok: false, reason: "invalid" };
    return { ok: true, needsTwoFactor: false };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isTwoFactorEnabled: true },
  });
  if (!user?.passwordHash) return { ok: false, reason: "invalid" };

  const pwOk = await bcrypt.compare(password, user.passwordHash);
  if (!pwOk) return { ok: false, reason: "invalid" };

  if (user.isTwoFactorEnabled) {
    return {
      ok: true,
      needsTwoFactor: true,
      userId: user.id,
      preLoginToken: createPreLoginToken(user.id),
    };
  }

  return { ok: true, needsTwoFactor: false, userId: user.id };
}
