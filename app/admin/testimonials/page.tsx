import { requireAdminPage } from "@/lib/auth/guards";
import { adminSlice } from "@/lib/admin/pagination";
import { connectDB, Testimonial } from "@/lib/db";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import AdminPagination from "@/components/admin/AdminPagination";

async function getTestimonials(pageParam?: string) {
  try {
    await connectDB();
    const total = await Testimonial.countDocuments();
    const { page, totalPages, skip, limit } = adminSlice(pageParam, total);
    const testimonials = await Testimonial.find()
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return { testimonials: JSON.parse(JSON.stringify(testimonials)), total, page, totalPages };
  } catch (error) {
    return { testimonials: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function TestimonialsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireAdminPage();
  const { page: pageParam } = await searchParams;
  const { testimonials, total, page, totalPages } = await getTestimonials(pageParam);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav role={session.role} name={session.name} current="testimonials" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">Testimonials ({total})</h1>
          <Link href="/admin/testimonials/new" className="btn-primary">Add testimonial</Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((testimonial: { _id: string; studentName: string; initials: string; origin: string; university: string; status: string; image?: string }) => (
                <tr key={testimonial._id} className="hover:bg-primary-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {testimonial.image ? (
                        <img src={testimonial.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary">
                          {testimonial.initials}
                        </span>
                      )}
                      <div>
                        <div className="text-sm font-bold text-primary-900">{testimonial.studentName}</div>
                        <div className="text-xs text-slate-600">{testimonial.initials}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{testimonial.origin}</td>
                  <td className="px-6 py-4 text-sm">{testimonial.university}</td>
                  <td className="px-6 py-4">
                    <span className={`chip ${testimonial.status === "published" ? "bg-success-tint text-primary-800" : "bg-slate-100 text-slate-700"}`}>
                      {testimonial.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/admin/testimonials/${testimonial._id}/edit`} className="text-primary hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AdminPagination page={page} totalPages={totalPages} />

          {testimonials.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-600">No testimonials yet</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
