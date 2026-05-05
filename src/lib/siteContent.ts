import { prisma } from "@/lib/prisma";

export const SITE_CONTENT_ID = "singleton" as const;

export type PublicSiteContent = {
  homeHeroMainText: string | null;
  homeHeroSubText: string | null;
  homeHeroImageUrl: string | null;
};

export async function getPublicSiteContent(): Promise<PublicSiteContent | null> {
  const row = await prisma.siteContent.findUnique({
    where: { id: SITE_CONTENT_ID },
    select: {
      homeHeroMainText: true,
      homeHeroSubText: true,
      homeHeroImageUrl: true,
    },
  });
  return row;
}
