import { CasaAdminProductsPanel } from "@/components/casa-admin/CasaAdminProductsPanel";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";

export default async function CasaAdminProductsPage() {
  await requireCasaAdmin();
  return <CasaAdminProductsPanel />;
}
