import { CasaAdminSiteContentForm } from "@/components/casa-admin/CasaAdminSiteContentForm";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_ID } from "@/lib/siteContent";

export default async function CasaAdminContentPage() {
  await requireCasaAdmin();

  const row = await prisma.siteContent.findUnique({
    where: { id: SITE_CONTENT_ID },
    select: {
      homeHeroMainText: true,
      homeHeroSubText: true,
      homeHeroImageUrl: true,
      gelPerUsdMinor: true,
      gelPerEurMinor: true,
      deliveryTbilisiCents: true,
      deliveryRegionCents: true,
      deliveryIntlCents: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Homepage content</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Override the hero copy and the large scroll-hero image. Below, adjust reference FX (for USD/EUR labels) and flat
          delivery fees used at checkout. Product base prices are edited under Products.
        </p>
      </div>
      <div className="max-w-2xl rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_97%,var(--sand))] p-6 shadow-sm">
        <CasaAdminSiteContentForm
          initial={{
            homeHeroMainText: row?.homeHeroMainText ?? null,
            homeHeroSubText: row?.homeHeroSubText ?? null,
            homeHeroImageUrl: row?.homeHeroImageUrl ?? null,
            gelPerUsdMinor: row?.gelPerUsdMinor ?? 270,
            gelPerEurMinor: row?.gelPerEurMinor ?? 290,
            deliveryTbilisiCents: row?.deliveryTbilisiCents ?? 500,
            deliveryRegionCents: row?.deliveryRegionCents ?? 1000,
            deliveryIntlCents: row?.deliveryIntlCents ?? 4500,
          }}
        />
      </div>
    </div>
  );
}
