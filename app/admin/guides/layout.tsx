import { requireAdminPage } from "@/lib/auth/guards";

export default async function GuidesLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
