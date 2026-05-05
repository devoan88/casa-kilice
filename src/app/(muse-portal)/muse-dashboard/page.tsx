import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { MuseDashboardClient } from "@/components/muse/MuseDashboardClient";
import { authOptions } from "@/lib/auth";
import { labelFromFileUrl } from "@/lib/muse/fileLabel";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Muse dashboard — Casa Kilicé",
  description: "Your Muse balance, rewards progress, and content submissions.",
};

export default async function MuseDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/account/sign-in?callbackUrl=/muse-dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      points: true,
      isMuse: true,
      museStatus: true,
      museDiscountCode15: true,
      museBirthdayBoxFlag: true,
      museFreeShipping: true,
      musePendingCelebration: true,
      contentSubmissions: {
        orderBy: { createdAt: "desc" },
        take: 40,
        select: {
          id: true,
          status: true,
          type: true,
          fileUrl: true,
          pointsAwarded: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/account/sign-in?callbackUrl=/muse-dashboard");
  }

  return (
    <MuseDashboardClient
      initial={{
        name: user.name,
        email: user.email,
        points: user.points,
        isMuse: user.isMuse,
        museStatus: user.museStatus,
        museDiscountCode15: user.museDiscountCode15,
        museBirthdayBoxFlag: user.museBirthdayBoxFlag,
        museFreeShipping: user.museFreeShipping,
        musePendingCelebration: user.musePendingCelebration,
        uploads: user.contentSubmissions.map((u) => ({
          id: u.id,
          status: u.status,
          type: u.type,
          fileUrl: u.fileUrl,
          displayName: labelFromFileUrl(u.fileUrl),
          pointsAwarded: u.pointsAwarded,
          createdAt: u.createdAt.toISOString(),
        })),
      }}
    />
  );
}
