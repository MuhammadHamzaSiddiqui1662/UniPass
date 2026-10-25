import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, University } from "@/lib/db";
import Link from "next/link";

async function getUniversities() {
  try {
    await connectDB();
    const universities = await University.find()
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(universities));
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return [];
  }
}

export default async function AdminUniversitiesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const universities = await getUniversities();

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
                  href="/admin/universities"
                  className="text-navy font-bold border-b-2 border-navy pb-1"
                >
                  Universities
                </Link>
                <Link href="/admin/guides" className="text-body hover:text-ink">
                  Guides
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-body">{session.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-body hover:text-ink"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">
            Universities ({universities.length})
          </h1>
          <Link href="/admin/universities/new" className="btn-primary">
            Add University
          </Link>
        </div>

        <div className="bg-white rounded-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-tint">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                    Type
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
                {universities.map((uni: any) => (
                  <tr key={uni._id} className="hover:bg-surface-tint/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-ink">{uni.name}</div>
                      <div className="text-xs text-body">{uni.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink">{uni.city}</td>
                    <td className="px-6 py-4 text-sm text-ink">{uni.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`chip ${
                          uni.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {uni.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/universities/${uni._id}/edit`}
                        className="text-navy hover:underline mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/universities/${uni.slug}`}
                        target="_blank"
                        className="text-body hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {universities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-body">No universities yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
