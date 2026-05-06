import { HomeClient } from "@/app/HomeClient";
import { getPublicSiteContent } from "@/lib/siteContent";

export const runtime = "nodejs";

export default async function Home() {
  let siteContent = null;
  try {
    siteContent = await getPublicSiteContent();
  } catch {
    siteContent = null;
  }
  return <HomeClient siteContent={siteContent} />;
}
