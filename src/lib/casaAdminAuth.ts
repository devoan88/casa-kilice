import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { normalizedAdminEmail } from "@/lib/adminEnv";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Optional env allowlist (e.g. visitor map APIs). Not used for /casa-admin access.
 */
export function getCasaAdminEmail(): string | null {
  const raw = normalizedAdminEmail();
  return raw || null;
}

/**
 * True if this user may access /casa-admin and casa-admin APIs:
 * `User.role === "ADMIN"`, or session email matches `ADMIN_EMAIL` (legacy / convenience).
 */
export async function resolveUserCasaAdminAccess(
  userId: string,
  email: string | null | undefined,
): Promise<boolean> {
  const envAdmin = getCasaAdminEmail();
  const e = email?.trim().toLowerCase();
  if (envAdmin && e && e === envAdmin) return true;

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return row?.role === "ADMIN";
}

/**
 * For server components / API after session is known. No session → redirect to `/casa-admin` (login UI).
 */
export async function requireCasaAdmin(): Promise<{ email: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    redirect("/casa-admin");
  }
  const ok = await resolveUserCasaAdminAccess(session.user.id, session.user.email);
  if (!ok) {
    redirect("/casa-admin");
  }
  return { email: session.user.email };
}

export async function isCasaAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  return resolveUserCasaAdminAccess(session.user.id, session.user.email);
}
