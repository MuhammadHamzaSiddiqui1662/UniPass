import { requireAdminPage } from "@/lib/auth/guards";
import { adminSlice } from "@/lib/admin/pagination";
import { connectDB, FAQ } from "@/lib/db";
import Link from "next/link";
import AdminPagination from "@/components/admin/AdminPagination";

async function getFAQs(pageParam?: string) {
  try {
    await connectDB();
    const total = await FAQ.countDocuments();
    const { page, totalPages, skip, limit } = adminSlice(pageParam, total);
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean();
    return { faqs: JSON.parse(JSON.stringify(faqs)), total, page, totalPages };
  } catch (error) {
    return { faqs: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function FAQsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  const { page: pageParam } = await searchParams;
  const { faqs, total, page, totalPages } = await getFAQs(pageParam);

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
                <Link href="/admin" className="text-slate-600 hover:text-primary-900">
                  Dashboard
                </Link>
                <Link href="/admin/faqs" className="text-primary font-bold border-b-2 border-primary pb-1">
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">FAQs ({total})</h1>
          <Link href="/admin/faqs/new" className="btn-primary">
            Add FAQ
          </Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase w-20">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faqs.map((faq: any) => (
                <tr key={faq._id} className="hover:bg-primary-50/50">
                  <td className="px-6 py-4 text-sm text-slate-600">{faq.order}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary-900">{faq.question}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`chip ${faq.status === 'published' ? 'bg-success-tint text-primary-800' : 'bg-slate-100 text-slate-700'}`}>
                      {faq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/faqs/${faq._id}/edit`} className="text-primary hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AdminPagination page={page} totalPages={totalPages} />

          {faqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No FAQs yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
