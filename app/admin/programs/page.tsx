import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, Program } from "@/lib/db";
import Link from "next/link";

async function getPrograms() {
  try {
    await connectDB();
    const programs = await Program.find().populate("university", "name").sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(programs));
  } catch (error) {
    return [];
  }
}

export default async function ProgramsAdminPage() {
  const session = await requireAuth().catch(() => redirect("/admin/login"));
  const programs = await getPrograms();

  return (
    <div className="min-h-screen bg-page-bg">
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="font-display text-xl text-ink">UniPass Admin</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Programs ({programs.length})</h1>
          <Link href="/admin/programs/new" className="btn-primary">Add Program</Link>
        </div>

        <div className="bg-white rounded-card border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-tint">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map((program: any) => (
                <tr key={program._id} className="hover:bg-surface-tint/50">
                  <td className="px-6 py-4 text-sm font-bold text-ink">{program.name}</td>
                  <td className="px-6 py-4 text-sm">{program.university?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm">{program.level}</td>
                  <td className="px-6 py-4">
                    <span className={`chip ${program.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {program.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/programs/${program._id}/edit`} className="text-navy hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {programs.length === 0 && (
            <div className="text-center py-12"><p className="text-body">No programs yet</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
