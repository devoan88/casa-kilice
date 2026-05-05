import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";

export default async function CasaAdminUsersPage() {
  await requireCasaAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    select: {
      id: true,
      email: true,
      name: true,
      points: true,
      isMuse: true,
      museStatus: true,
      instagramHandle: true,
      museDiscountCode15: true,
      museBirthdayBoxFlag: true,
      museFreeShipping: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Users</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">Latest 250 accounts (read-only).</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-3 py-3">Joined</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Instagram</th>
              <th className="px-3 py-3 text-right">Points</th>
              <th className="px-3 py-3">Muse</th>
              <th className="px-3 py-3">Tier</th>
              <th className="px-3 py-3">Rewards</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] align-top last:border-0"
              >
                <td className="px-3 py-3 whitespace-nowrap text-xs text-muted">
                  {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "short" })}
                </td>
                <td className="max-w-[180px] truncate px-3 py-3 font-mono text-xs">{u.email ?? "—"}</td>
                <td className="max-w-[120px] truncate px-3 py-3 text-xs">{u.name ?? "—"}</td>
                <td className="max-w-[120px] truncate px-3 py-3 font-mono text-xs">{u.instagramHandle ?? "—"}</td>
                <td className="px-3 py-3 text-right tabular-nums text-xs font-medium">{u.points}</td>
                <td className="px-3 py-3 text-xs">{u.isMuse ? "Yes" : "—"}</td>
                <td className="px-3 py-3 text-xs">{u.museStatus ?? "—"}</td>
                <td className="px-3 py-3 text-[10px] leading-relaxed text-muted">
                  {u.museDiscountCode15 ? <span className="block font-mono text-[color:var(--espresso)]">15%: {u.museDiscountCode15}</span> : null}
                  {u.museBirthdayBoxFlag ? <span className="block">Birthday box</span> : null}
                  {u.museFreeShipping ? <span className="block">Free shipping</span> : null}
                  {!u.museDiscountCode15 && !u.museBirthdayBoxFlag && !u.museFreeShipping ? "—" : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
