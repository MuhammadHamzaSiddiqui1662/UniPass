import BulkImportClient from "@/components/admin/BulkImportClient";
import { requireAdminPage } from "@/lib/auth/guards";

export default async function BulkImportPage() {
  await requireAdminPage();
  return <BulkImportClient />;
}
