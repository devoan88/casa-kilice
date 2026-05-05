import { HomeClient } from "@/app/HomeClient";
import { getPublicSiteContent } from "@/lib/siteContent";

export default async function Home() {
  const siteContent = await getPublicSiteContent();
  return <HomeClient siteContent={siteContent} />;
}
