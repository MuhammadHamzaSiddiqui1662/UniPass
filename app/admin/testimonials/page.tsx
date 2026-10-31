import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectDB, Testimonial } from "@/lib/db";
import Link from "next/link";

async function getTestimonials() {
  try {
    await connectDB();
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(testimonials));
  } catch (error) {
    return [];
  }
}

export default async function TestimonialsAdminPage() {
  const session = await requireAuth().catch(() => redirect("/admin/login"));
  const testimonials = await getTestimonials();

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
          <h1 className="text-2xl font-display">Testimonials ({testimonials.length})</h1>
          <Link href="/admin/testimonials/new" className="btn-primary">Add Testimonial</Link>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">University</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((testimonial: any) => (
                <tr key={testimonial._id} className="hover:bg-primary-50/50">
                  <td className="px-6 py-4 text-sm">{testimonial.order}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary-900">{testimonial.studentName}</td>
                  <td className="px-6 py-4 text-sm">{testimonial.university}</td>
                  <td className="px-6 py-4">
                    <span className={`chip ${testimonial.status === 'published' ? 'bg-success-tint text-primary-800' : 'bg-slate-100 text-slate-700'}`}>
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

          {testimonials.length === 0 && (
            <div className="text-center py-12"><p className="text-slate-600">No testimonials yet</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
