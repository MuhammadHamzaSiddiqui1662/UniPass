import AdminNav from "@/components/admin/AdminNav";
import BulkImportClient from "@/components/admin/BulkImportClient";
import { requireAdminPage } from "@/lib/auth/guards";

export default async function BulkImportPage() {
  const session = await requireAdminPage();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav role={session.role} name={session.name} current="universities" />
      <BulkImportClient />
    </div>
  );
}
