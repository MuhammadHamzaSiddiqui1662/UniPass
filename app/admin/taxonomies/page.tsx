import TaxonomyGroup from "@/components/admin/TaxonomyGroup";
import { requireAdminPage } from "@/lib/auth/guards";
import { connectDB, Taxonomy } from "@/lib/db";
import Link from "next/link";

async function getTaxonomies() {
  try {
    await connectDB();
    const taxonomies = await Taxonomy.find().sort({ type: 1, order: 1 }).lean();
    return JSON.parse(JSON.stringify(taxonomies));
  } catch (error) {
    return [];
  }
}

export default async function TaxonomiesAdminPage() {
  await requireAdminPage();
  const taxonomies = await getTaxonomies();

  const grouped: any = {};
  taxonomies.forEach((tax: any) => {
    if (!grouped[tax.type]) grouped[tax.type] = [];
    grouped[tax.type].push(tax);
  });

  const typeLabels: any = {
    pakistani_city: "Pakistani Cities",
    turkish_city: "Turkish Cities",
    study_field: "Study Fields",
    study_level: "Study Levels",
    best_time: "Best Times to Reach",
  };

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
          <h1 className="text-2xl font-display">Taxonomies</h1>
          <Link href="/admin/taxonomies/new" className="btn-primary">Add Taxonomy</Link>
        </div>

        <div className="space-y-6">
          {Object.keys(typeLabels).map((type) => (
            <TaxonomyGroup key={type} title={typeLabels[type]} items={grouped[type] ?? []} />
          ))}
        </div>
      </main>
    </div>
  );
}
