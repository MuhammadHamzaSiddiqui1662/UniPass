import { redirect } from "next/navigation";
import { isAdminTier } from "@/lib/auth/permissions";
import { getSession, type SessionData } from "@/lib/auth/session";

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAdminPage(): Promise<SessionData> {
  const session = await requireSession();
  if (!isAdminTier(session.role)) redirect("/admin");
  return session;
}
