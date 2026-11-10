import { requireAdminPage } from "@/lib/auth/guards";
import { canEditUser, ROLE_LABELS, type UserRole } from "@/lib/auth/permissions";
import { connectDB, User } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";

async function getUsers() {
  try {
    await connectDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    return [];
  }
}

function roleChip(role: UserRole) {
  if (role === "super_admin" || role === "admin") return "bg-primary/10 text-primary";
  if (role === "supervisor") return "bg-info-tint text-primary-800";
  return "bg-slate-100 text-slate-700";
}

export default async function UsersPage() {
  const session = await requireAdminPage();
  const users = await getUsers();
  const actor = { id: session.userId, role: session.role };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav role={session.role} name={session.name} current="users" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Users ({users.length})</h1>
          <Link href="/admin/users/new" className="btn-primary">
            Add User
          </Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user: { _id: string; name: string; email: string; role: UserRole; active: boolean }) => {
                const editable = canEditUser(actor, { id: user._id, role: user.role });
                return (
                  <tr key={user._id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-primary-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-primary-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`chip ${roleChip(user.role)}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`chip ${user.active ? "bg-success-tint text-primary-800" : "bg-error-tint text-primary-900"}`}>
                        {user.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editable ? (
                        <Link href={`/admin/users/${user._id}/edit`} className="text-primary hover:underline">
                          Edit
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No users yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
