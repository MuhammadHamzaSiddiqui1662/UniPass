import { requireAdminPage } from "@/lib/auth/guards";
import { assignableRoles } from "@/lib/auth/permissions";
import CreateUserClient from "@/components/admin/CreateUserClient";

export default async function NewUserPage() {
  const session = await requireAdminPage();
  return <CreateUserClient roles={assignableRoles(session.role)} />;
}
