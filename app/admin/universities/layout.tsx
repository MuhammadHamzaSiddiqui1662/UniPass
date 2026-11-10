import { requireAdminPage } from "@/lib/auth/guards";

export default async function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
