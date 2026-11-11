import { requireAdminPage } from "@/lib/auth/guards";
import AdminNav from "@/components/admin/AdminNav";

export default async function HeroLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav role={session.role} name={session.name} current="hero" />
      {children}
    </div>
  );
}
