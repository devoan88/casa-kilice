import { prisma } from "@/lib/prisma";

import { MUSE_POINTS_PHOTO_APPROVED, MUSE_POINTS_VIDEO_APPROVED } from "@/lib/muse/points";
import { applyMuseRewardsAfterPointChange } from "@/lib/muse/tierAutomation";

/**
 * Call from a trusted admin path only. Awards photo/video points once per submission,
 * then runs server-side tier / discount / celebration automation.
 */
export async function approveContentSubmission(submissionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.contentSubmission.findUnique({ where: { id: submissionId } });
  if (!row) return { ok: false, error: "Submission not found." };
  if (row.status === "Approved") return { ok: false, error: "Already approved." };

  const delta = row.type === "Video" ? MUSE_POINTS_VIDEO_APPROVED : MUSE_POINTS_PHOTO_APPROVED;

  const before = await prisma.user.findUnique({
    where: { id: row.userId },
    select: { points: true },
  });
  const oldPoints = before?.points ?? 0;

  await prisma.$transaction([
    prisma.contentSubmission.update({
      where: { id: submissionId },
      data: { status: "Approved", pointsAwarded: delta },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { points: { increment: delta } },
    }),
  ]);

  await applyMuseRewardsAfterPointChange(row.userId, oldPoints, oldPoints + delta);

  return { ok: true };
}
