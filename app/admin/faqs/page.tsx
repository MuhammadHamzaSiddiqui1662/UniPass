import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, FAQ } from "@/lib/db";
import Link from "next/link";

async function getFAQs() {
  try {
    await connectDB();
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(faqs));
  } catch (error) {
    return [];
  }
}

export default async function FAQsPage() {
  const session = await requireAuth().catch(() => redirect("/admin/login"));
  const faqs = await getFAQs();

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
                <Link href="/admin/faqs" className="text-navy font-bold border-b-2 border-navy pb-1">
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">FAQs ({faqs.length})</h1>
          <Link href="/admin/faqs/new" className="btn-primary">
            Add FAQ
          </Link>
        </div>

        <div className="bg-white rounded-card border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-tint">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase w-20">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-body uppercase">
                  Question
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
              {faqs.map((faq: any) => (
                <tr key={faq._id} className="hover:bg-surface-tint/50">
                  <td className="px-6 py-4 text-sm text-body">{faq.order}</td>
                  <td className="px-6 py-4 text-sm font-bold text-ink">{faq.question}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`chip ${faq.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {faq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/faqs/${faq._id}/edit`} className="text-navy hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {faqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-body">No FAQs yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
