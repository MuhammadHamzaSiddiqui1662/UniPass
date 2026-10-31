import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, Program } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { CourseSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

async function getProgram(slug: string) {
  try {
    await connectDB();
    const program = await Program.findOne({ slug, status: "published" })
      .populate("university", "name slug city")
      .lean();
    return program ? JSON.parse(JSON.stringify(program)) : null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params: rawParams,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await rawParams;
  const program = await getProgram(params.slug);

  if (!program) {
    return { title: "Program Not Found" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return {
    title: program.metaTitle || `${program.name} | ${program.university?.name} | UniPass`,
    description: program.metaDescription || program.description,
    openGraph: {
      title: program.metaTitle || program.name,
      description: program.metaDescription || program.description,
      url: `${baseUrl}/programs/${program.slug}`,
      type: "website",
    },
  };
}

export default async function ProgramDetailPage({
  params: rawParams,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = await rawParams;
  const program = await getProgram(params.slug);

  if (!program) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return (
    <>
      <CourseSchema program={program} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Programs", url: `${baseUrl}/programs` },
          { name: program.name, url: `${baseUrl}/programs/${program.slug}` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <section className="py-12 bg-slate-50">
          <div className="container-1200">
            <div className="mb-6">
              <Link href="/programs" className="text-primary hover:underline text-sm">
                ← Back to programs
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-h1-detail mb-4">{program.name}</h1>
                {program.university && (
                  <p className="text-lg text-slate-600 mb-6">
                    <Link href={`/universities/${program.university.slug}`} className="text-primary hover:underline">
                      {program.university.name}
                    </Link>
                    {" · "}
                    {program.university.city}
                  </p>
                )}

                <div className="flex gap-3 mb-8">
                  <span className="chip-tint">{program.level}</span>
                  <span className="chip-tint">{program.language}</span>
                  {program.duration && <span className="chip-tint">{program.duration}</span>}
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-h3 mb-4">About this Program</h2>
                  <p className="text-slate-600 leading-relaxed mb-6">{program.description}</p>

                  {program.requirements && (
                    <>
                      <h3 className="text-h3 mb-4 mt-8">Requirements</h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">{program.requirements}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-card border border-slate-200 p-6 sticky top-24">
                  <h3 className="font-display text-xl mb-4">Program Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-bold text-slate-600">Level</dt>
                      <dd className="text-primary-900">{program.level}</dd>
                    </div>
                    {program.field && (
                      <div>
                        <dt className="font-bold text-slate-600">Field</dt>
                        <dd className="text-primary-900">{program.field}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-bold text-slate-600">Language</dt>
                      <dd className="text-primary-900">{program.language}</dd>
                    </div>
                    {program.duration && (
                      <div>
                        <dt className="font-bold text-slate-600">Duration</dt>
                        <dd className="text-primary-900">{program.duration}</dd>
                      </div>
                    )}
                    {program.tuition && (
                      <div>
                        <dt className="font-bold text-slate-600">Tuition</dt>
                        <dd className="text-primary-900">{program.tuition}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="font-bold mb-3">Interested in this program?</h4>
                    <Link href={`/#book?program=${program._id}`} className="btn-primary w-full text-center block">
                      Book Free Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
