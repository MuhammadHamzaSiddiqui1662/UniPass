import { requireAdminPage } from "@/lib/auth/guards";
import { connectDB, University } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import UniversitiesWorkspace, { type AdminUniversity } from "@/components/admin/UniversitiesWorkspace";

async function getUniversities(): Promise<AdminUniversity[]> {
  try {
    await connectDB();
    const universities = await University.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(universities)).map(
      (university: {
        _id: string;
        name?: string;
        slug?: string;
        city?: string;
        type?: string;
        status?: string;
        featuredOnHome?: boolean;
        homeOrder?: number;
      }): AdminUniversity => ({
        id: String(university._id),
        name: university.name ?? "",
        slug: university.slug ?? "",
        city: university.city ?? "",
        type: university.type ?? "",
        status: university.status ?? "draft",
        featuredOnHome: Boolean(university.featuredOnHome),
        homeOrder: university.homeOrder ?? 0,
      }),
    );
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <UniversitiesWorkspace universities={universities} />
      </main>
    </div>
  );
}
