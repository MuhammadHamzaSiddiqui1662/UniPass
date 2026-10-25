import { requireAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, User } from "@/lib/db";
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

export default async function UsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin");
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-page-bg">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-display text-xl text-ink">
                UniPass Admin
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/admin" className="text-body hover:text-ink">
                  Dashboard
                </Link>
                <Link href="/admin/leads" className="text-body hover:text-ink">
                  Leads
                </Link>
                <Link
                  href="/admin/users"
                  className="text-navy font-bold border-b-2 border-navy pb-1"
                >
                  Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Users ({users.length})</h1>
          <Link href="/admin/users/new" className="btn-primary">
            Add User
          </Link>
        </div>

        <div className="bg-white rounded-card border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-tint">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user: any) => (
                <tr key={user._id} className="hover:bg-surface-tint/50">
                  <td className="px-6 py-4 text-sm font-bold text-ink">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-ink">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`chip ${user.role === 'admin' ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`chip ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/admin/users/${user._id}/edit`}
                      className="text-navy hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-body">No users yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
