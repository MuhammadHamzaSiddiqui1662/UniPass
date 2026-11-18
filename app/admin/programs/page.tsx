import { requireAdminPage } from "@/lib/auth/guards";
import { adminSlice } from "@/lib/admin/pagination";
import { connectDB, Program } from "@/lib/db";
import Link from "next/link";
import AdminPagination from "@/components/admin/AdminPagination";

async function getPrograms(pageParam?: string) {
  try {
    await connectDB();
    const total = await Program.countDocuments();
    const { page, totalPages, skip, limit } = adminSlice(pageParam, total);
    const programs = await Program.find()
      .populate("university", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return { programs: JSON.parse(JSON.stringify(programs)), total, page, totalPages };
  } catch (error) {
    return { programs: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function ProgramsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  const { page: pageParam } = await searchParams;
  const { programs, total, page, totalPages } = await getPrograms(pageParam);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="font-display text-xl text-primary-900">UniPass Admin</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Programs ({total})</h1>
          <Link href="/admin/programs/new" className="btn-primary">Add Program</Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map((program: any) => (
                <tr key={program._id} className="hover:bg-primary-50/50">
                  <td className="px-6 py-4 text-sm font-bold text-primary-900">{program.name}</td>
                  <td className="px-6 py-4 text-sm">{program.university?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm">{program.level}</td>
                  <td className="px-6 py-4">
                    <span className={`chip ${program.status === 'published' ? 'bg-success-tint text-primary-800' : 'bg-slate-100 text-slate-700'}`}>
                      {program.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/programs/${program._id}/edit`} className="text-primary hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AdminPagination page={page} totalPages={totalPages} />

          {programs.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-600">No programs yet</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
