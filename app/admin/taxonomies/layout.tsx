import { requireAdminPage } from "@/lib/auth/guards";

export default async function TaxonomiesLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
