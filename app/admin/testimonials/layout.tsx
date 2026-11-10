import { requireAdminPage } from "@/lib/auth/guards";

export default async function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
