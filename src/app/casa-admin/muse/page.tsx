import { CasaAdminMuseGrid, type CasaAdminMuseRow } from "@/components/casa-admin/CasaAdminMuseGrid";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";

export default async function CasaAdminMusePage() {
  await requireCasaAdmin();

  const submissions = await prisma.contentSubmission.findMany({
    where: { status: "Pending" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, instagramHandle: true } },
    },
  });

  const rows: CasaAdminMuseRow[] = submissions.map((s) => ({
    id: s.id,
    type: s.type,
    createdAt: s.createdAt.toISOString(),
    userName: s.user.name,
    instagramHandle: s.user.instagramHandle,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Muse approvals</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Pending uploads only. Approving awards points and runs milestone rewards automatically.
        </p>
      </div>
      <CasaAdminMuseGrid rows={rows} />
    </div>
  );
}
