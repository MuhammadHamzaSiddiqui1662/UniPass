import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, Guide } from "@/lib/db";
import Link from "next/link";

async function getGuides() {
  try {
    await connectDB();
    const guides = await Guide.find().sort({ featured: -1, order: 1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(guides));
  } catch (error) {
    return [];
  }
}

export default async function GuidesAdminPage() {
  const session = await requireAuth().catch(() => redirect("/admin/login"));
  const guides = await getGuides();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-display text-xl text-primary-900">
                UniPass Admin
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/admin" className="text-slate-600 hover:text-primary-900">Dashboard</Link>
                <Link href="/admin/guides" className="text-primary font-bold border-b-2 border-primary pb-1">Guides</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Guides ({guides.length})</h1>
          <Link href="/admin/guides/new" className="btn-primary">Add Guide</Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guides.map((guide: any) => (
                <tr key={guide._id} className="hover:bg-primary-50/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-primary-900">{guide.title}</div>
                    <div className="text-xs text-slate-600">{guide.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{guide.category}</td>
                  <td className="px-6 py-4">
                    <span className={`chip ${guide.status === 'published' ? 'bg-success-tint text-primary-800' : 'bg-slate-100 text-slate-700'}`}>
                      {guide.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/guides/${guide._id}/edit`} className="text-primary hover:underline mr-4">Edit</Link>
                    <Link href={`/guides/${guide.slug}`} target="_blank" className="text-slate-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {guides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No guides yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
