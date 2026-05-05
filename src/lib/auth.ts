import crypto from "crypto";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  normalizedAdminEmail,
  normalizedAdminPasswordHash,
  normalizedAdminPasswordPlain,
} from "@/lib/adminEnv";
import { prisma } from "@/lib/prisma";
import { decryptTwoFactorSecret } from "@/lib/security/twoFactorCrypto";
import { verifyPreLoginToken } from "@/lib/security/preLoginToken";
import { verifyTotpToken } from "@/lib/twoFactor/otp";

function timingSafeStringEqual(a: string, b: string): boolean {
  const tag = "casa-credentials";
  const digest = (s: string) => crypto.createHmac("sha256", tag).update(s).digest();
  try {
    return crypto.timingSafeEqual(digest(a), digest(b));
  } catch {
    return false;
  }
}

const credentialsSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().max(512).optional(),
    totpCode: z.string().regex(/^\d{6}$/).optional(),
    preLoginToken: z.string().min(20).max(4096).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.preLoginToken && data.totpCode) return;
    const pwd = data.password;
    if (!pwd || pwd.length < 1) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "Required" });
      return;
    }
    const adminEmail = normalizedAdminEmail();
    const inputEmail = data.email.trim().toLowerCase();
    const isEnvAdminLogin = Boolean(adminEmail && inputEmail === adminEmail);
    // Muse accounts: min 8. Env-listed admin can use shorter dev passwords / hash still validated in authorize().
    if (!isEnvAdminLogin && pwd.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    }
  });

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(
    prisma as unknown as Parameters<typeof PrismaAdapter>[0],
  ),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "Authenticator code", type: "text" },
        preLoginToken: { label: "2FA token", type: "text" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password ?? "";
        const totpCode = parsed.data.totpCode;
        const preLoginToken = parsed.data.preLoginToken;

        if (preLoginToken && totpCode) {
          const claims = verifyPreLoginToken(preLoginToken);
          if (!claims) return null;
          const user = await prisma.user.findUnique({
            where: { id: claims.sub },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isTwoFactorEnabled: true,
              twoFactorSecret: true,
            },
          });
          if (
            !user?.email ||
            user.email !== email ||
            !user.isTwoFactorEnabled ||
            !user.twoFactorSecret
          ) {
            return null;
          }
          try {
            const secret = decryptTwoFactorSecret(user.twoFactorSecret);
            if (!verifyTotpToken(secret, totpCode)) return null;
          } catch {
            return null;
          }
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        const adminEmail = normalizedAdminEmail();
        const adminPasswordHash = normalizedAdminPasswordHash();
        const adminPasswordPlain = normalizedAdminPasswordPlain();
        const inputEmail = email;

        if (adminEmail && inputEmail === adminEmail) {
          let adminOk = false;
          if (adminPasswordHash) {
            try {
              adminOk = await bcrypt.compare(password, adminPasswordHash);
            } catch {
              adminOk = false;
            }
          } else if (adminPasswordPlain) {
            adminOk = timingSafeStringEqual(password, adminPasswordPlain);
          }
          if (!adminOk) return null;

          const passwordHash = await bcrypt.hash(password, 12);
          const user = await prisma.user.upsert({
            where: { email: adminEmail },
            create: {
              email: adminEmail,
              name: "Administrator",
              role: "ADMIN",
              passwordHash,
            },
            update: { role: "ADMIN", passwordHash },
            select: { id: true, email: true, name: true, role: true },
          });
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            isTwoFactorEnabled: true,
          },
        });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        if (user.isTwoFactorEnabled) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        const row = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        session.user.role = row?.role ?? (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};
