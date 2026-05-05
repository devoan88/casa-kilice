import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { resolveUserCasaAdminAccess } from "@/lib/casaAdminAuth";

export async function assertCasaAdminApi(): Promise<
  { ok: true; email: string; userId: string } | { ok: false }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return { ok: false };

  const ok = await resolveUserCasaAdminAccess(session.user.id, session.user.email);
  if (!ok) return { ok: false };

  return { ok: true, email: session.user.email, userId: session.user.id };
}
