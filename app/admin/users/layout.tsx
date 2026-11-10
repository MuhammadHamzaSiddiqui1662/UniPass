import { requireAdminPage } from "@/lib/auth/guards";

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
