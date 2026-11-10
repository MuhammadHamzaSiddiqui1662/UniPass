import AdminNav from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/auth/guards";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return (
    <>
      <AdminNav role={session.role} name={session.name} current="settings" />
      {children}
    </>
  );
}
