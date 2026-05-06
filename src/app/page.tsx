import { HomeClient } from "@/app/HomeClient";
import { getPublicSiteContent } from "@/lib/siteContent";

export const runtime = "nodejs";

export default async function Home() {
  console.log("[home] render start");
  let siteContent = null;
  try {
    siteContent = await getPublicSiteContent();
    console.log("[home] siteContent ok", { hasContent: Boolean(siteContent) });
  } catch (e) {
    console.error("[home] siteContent error", e);
    siteContent = null;
  }
  return <HomeClient siteContent={siteContent} />;
}
