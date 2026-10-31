import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, Program, University } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs | Study in Türkiye | UniPass",
  description: "Browse degree programs at Turkish universities. Find Bachelor's, Master's, and PhD programs taught in English or Turkish.",
};

async function getPrograms() {
  try {
    await connectDB();
    const programs = await Program.find({ status: "published" })
      .populate("university", "name slug city")
      .lean();
    return JSON.parse(JSON.stringify(programs));
  } catch (error) {
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-slate-50">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-6">Degree Programs in Türkiye</h1>
            <p className="text-lg text-slate-600 mb-12 max-w-3xl">
              Explore undergraduate and graduate programs at Turkish universities.
              Find programs taught in English or Turkish across all fields of study.
            </p>

            {programs.length === 0 ? (
              <p className="text-slate-600">No programs available yet. Check back soon!</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program: any) => (
                  <Link
                    key={program._id}
                    href={`/programs/${program.slug}`}
                    className="bg-white rounded-card border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="font-display text-xl mb-2">{program.name}</h3>
                    {program.university && (
                      <p className="text-sm text-slate-600 mb-3">
                        {program.university.name} · {program.university.city}
                      </p>
                    )}
                    <div className="flex gap-2 mb-3">
                      <span className="chip-tint text-xs">{program.level}</span>
                      <span className="chip-tint text-xs">{program.language}</span>
                    </div>
                    {program.duration && (
                      <p className="text-sm text-slate-600">{program.duration}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
