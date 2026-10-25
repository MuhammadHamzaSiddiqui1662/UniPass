import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, University } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { UniversitySchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { formatCurrency } from "@/lib/utils/format";

async function getUniversity(slug: string) {
  try {
    await connectDB();
    const university = await University.findOne({ slug, status: "published" }).lean();
    return university ? JSON.parse(JSON.stringify(university)) : null;
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
  const university = await getUniversity(params.slug);

  if (!university) {
    return { title: "University Not Found" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return {
    title: university.metaTitle || `${university.name} | Study in Türkiye | UniPass`,
    description: university.metaDescription || university.description,
    openGraph: {
      title: university.metaTitle || university.name,
      description: university.metaDescription || university.description,
      url: `${baseUrl}/universities/${university.slug}`,
      type: "website",
    },
  };
}

export default async function UniversityDetailPage({
  params: rawParams,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = await rawParams;
  const university = await getUniversity(params.slug);

  if (!university) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return (
    <>
      <UniversitySchema university={university} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Universities", url: `${baseUrl}/universities` },
          { name: university.name, url: `${baseUrl}/universities/${university.slug}` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <section className="py-12 bg-page-bg">
          <div className="container-1200">
            <div className="mb-6">
              <Link href="/universities" className="text-navy hover:underline text-sm">
                ← Back to universities
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-h1-detail mb-4">{university.name}</h1>
                <p className="text-lg text-body mb-6">{university.city} · {university.type}</p>

                <div className="flex gap-3 mb-8">
                  {university.fields?.slice(0, 3).map((field: string) => (
                    <span key={field} className="chip-tint">{field}</span>
                  ))}
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-h3 mb-4">About</h2>
                  <p className="text-body leading-relaxed mb-6">{university.description}</p>

                  {university.fields && university.fields.length > 0 && (
                    <>
                      <h3 className="text-h3 mb-4 mt-8">Fields of Study</h3>
                      <div className="flex flex-wrap gap-2">
                        {university.fields.map((field: string) => (
                          <span key={field} className="chip">{field}</span>
                        ))}
                      </div>
                    </>
                  )}

                  {university.levels && university.levels.length > 0 && (
                    <>
                      <h3 className="text-h3 mb-4 mt-8">Levels Offered</h3>
                      <div className="flex gap-2">
                        {university.levels.map((level: string) => (
                          <span key={level} className="chip">{level}</span>
                        ))}
                      </div>
                    </>
                  )}

                  {university.facts && university.facts.length > 0 && (
                    <>
                      <h3 className="text-h3 mb-4 mt-8">Key Facts</h3>
                      <ul className="space-y-2">
                        {university.facts.map((fact: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-teal">✓</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-card border border-border p-6 sticky top-24">
                  <h3 className="font-display text-xl mb-4">Quick Info</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-bold text-body">Type</dt>
                      <dd className="text-ink">{university.type}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-body">City</dt>
                      <dd className="text-ink">{university.city}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-body">Tuition (USD/year)</dt>
                      <dd className="text-ink">
                        {formatCurrency(university.tuitionFrom)}
                        {university.tuitionTo && ` - ${formatCurrency(university.tuitionTo)}`}
                      </dd>
                    </div>
                    {university.hasMeritScholarship && (
                      <div>
                        <dt className="font-bold text-body">Merit Scholarship</dt>
                        <dd className="text-teal">Available</dd>
                      </div>
                    )}
                    {university.website && (
                      <div>
                        <dt className="font-bold text-body">Website</dt>
                        <dd>
                          <a href={university.website} target="_blank" rel="noopener noreferrer" className="text-navy hover:underline text-sm">
                            Visit Website →
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Link href={`/#book?university=${university._id}`} className="btn-primary w-full text-center block">
                      Book Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual CTA */}
            <div className="mt-12 bg-navy/5 rounded-card p-8 text-center">
              <h3 className="font-display text-2xl mb-4">Interested in {university.name}?</h3>
              <p className="text-body mb-6 max-w-2xl mx-auto">
                Book a free consultation to learn more about applying to this university and explore scholarship opportunities.
              </p>
              <Link href={`/#book?university=${university._id}`} className="btn-primary px-8 py-3">
                Book Free Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
