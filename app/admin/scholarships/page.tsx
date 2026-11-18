import { requireAdminPage } from "@/lib/auth/guards";
import { adminSlice } from "@/lib/admin/pagination";
import { connectDB, Scholarship } from "@/lib/db";
import Link from "next/link";
import AdminPagination from "@/components/admin/AdminPagination";

async function getScholarships(pageParam?: string) {
  try {
    await connectDB();
    const total = await Scholarship.countDocuments();
    const { page, totalPages, skip, limit } = adminSlice(pageParam, total);
    const scholarships = await Scholarship.find()
      .populate("university", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return { scholarships: JSON.parse(JSON.stringify(scholarships)), total, page, totalPages };
  } catch (error) {
    return { scholarships: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function ScholarshipsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  const { page: pageParam } = await searchParams;
  const { scholarships, total, page, totalPages } = await getScholarships(pageParam);

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
          <h1 className="text-2xl font-display">Scholarships ({total})</h1>
          <Link href="/admin/scholarships/new" className="btn-primary">Add Scholarship</Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scholarships.map((scholarship: any) => (
                <tr key={scholarship._id} className="hover:bg-primary-50/50">
                  <td className="px-6 py-4 text-sm font-bold text-primary-900">{scholarship.name}</td>
                  <td className="px-6 py-4 text-sm">{scholarship.type}</td>
                  <td className="px-6 py-4 text-sm">{scholarship.university?.name || "General"}</td>
                  <td className="px-6 py-4">
                    <span className={`chip ${scholarship.status === 'published' ? 'bg-success-tint text-primary-800' : 'bg-slate-100 text-slate-700'}`}>
                      {scholarship.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/scholarships/${scholarship._id}/edit`} className="text-primary hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AdminPagination page={page} totalPages={totalPages} />

          {scholarships.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-600">No scholarships yet</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
