import { requireAdminPage } from "@/lib/auth/guards";
import { connectDB, University } from "@/lib/db";
import Link from "next/link";
import HomeSliderManager from "@/components/admin/HomeSliderManager";
import AdminNav from "@/components/admin/AdminNav";

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
  const session = await requireAdminPage();

  const universities = await getUniversities();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav role={session.role} name={session.name} current="universities" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HomeSliderManager
          universities={universities.filter((university: { status?: string }) => university.status === "published").map((university: { _id: string; name: string; city: string; featuredOnHome?: boolean; homeOrder?: number }) => ({
            id: String(university._id),
            name: university.name,
            city: university.city,
            featuredOnHome: Boolean(university.featuredOnHome),
            homeOrder: university.homeOrder ?? 0,
          }))}
        />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-display">
            Universities ({universities.length})
          </h1>
          <div className="flex gap-3">
            <Link href="/admin/universities/import" className="btn-outline px-4">
              Bulk import
            </Link>
            <Link href="/admin/universities/new" className="btn-primary">
              Add University
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Type
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
                {universities.map((uni: any) => (
                  <tr key={uni._id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-primary-900">{uni.name}</div>
                      <div className="text-xs text-slate-600">{uni.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary-900">{uni.city}</td>
                    <td className="px-6 py-4 text-sm text-primary-900">{uni.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`chip ${
                          uni.status === "published"
                            ? "bg-success-tint text-primary-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {uni.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/universities/${uni._id}/edit`}
                        className="text-primary hover:underline mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/universities/${uni.slug}`}
                        target="_blank"
                        className="text-slate-600 hover:underline"
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
              <p className="text-slate-600">No universities yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
