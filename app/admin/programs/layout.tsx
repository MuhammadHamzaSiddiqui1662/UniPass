import { requireAdminPage } from "@/lib/auth/guards";

export default async function ProgramsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
