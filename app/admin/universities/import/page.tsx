import { redirect } from "next/navigation";
import BulkImportClient from "@/components/admin/BulkImportClient";
import { getSession } from "@/lib/auth/session";

export default async function BulkImportPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin/universities");
  return <BulkImportClient />;
}
