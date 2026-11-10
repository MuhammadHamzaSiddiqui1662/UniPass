import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/guards";
import {
  assignableRoles,
  canDeleteUser,
  canDeactivateUser,
  canEditUser,
  type UserRole,
} from "@/lib/auth/permissions";
import { connectDB, User } from "@/lib/db";
import EditUserClient from "@/components/admin/EditUserClient";

export default async function EditUserPage({
  params: rawParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminPage();
  const params = await rawParams;

  await connectDB();
  const user = await User.findById(params.id).select("-password").lean();
  if (!user) redirect("/admin/users");

  const actor = { id: session.userId, role: session.role };
  const target = { id: String(user._id), role: user.role as UserRole };
  if (!canEditUser(actor, target)) redirect("/admin/users");

  return (
    <EditUserClient
      user={{
        _id: target.id,
        name: user.name,
        email: user.email,
        role: target.role,
        active: user.active,
      }}
      roles={assignableRoles(session.role)}
      lockRole={target.role === "super_admin"}
      lockActive={!canDeactivateUser(actor, target)}
      canDelete={canDeleteUser(actor, target)}
    />
  );
}
