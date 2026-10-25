import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, Scholarship } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Scholarships | Study in Türkiye | UniPass",
  description: "Explore scholarships for Pakistani students studying in Türkiye, including Türkiye Bursları and university merit scholarships.",
  openGraph: {
    title: "Scholarships for Pakistani Students in Türkiye",
    description: "Türkiye Bursları and university merit scholarships",
    type: "website",
  },
};

async function getScholarships() {
  try {
    await connectDB();
    const scholarships = await Scholarship.find({ status: "published" })
      .sort({ type: 1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(scholarships));
  } catch (error) {
    return [];
  }
}

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  const turkiyeBursları = scholarships.filter(
    (s: any) => s.type === "turkiye-burslari"
  );
  const universityScholarships = scholarships.filter(
    (s: any) => s.type === "university-merit"
  );

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Scholarships", url: `${baseUrl}/scholarships` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-page-bg">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-6">Scholarships for Pakistani Students</h1>
            <p className="text-lg text-body mb-12 max-w-3xl">
              Learn about scholarship opportunities to study in Türkiye, from the
              prestigious Türkiye Bursları government scholarship to university-specific
              merit awards.
            </p>

            {/* Türkiye Bursları */}
            {turkiyeBursları.length > 0 && (
              <div className="mb-12">
                <h2 className="text-h2 mb-6">Türkiye Bursları (Government Scholarship)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {turkiyeBursları.map((scholarship: any) => (
                    <div
                      key={scholarship._id}
                      className="bg-white rounded-card border border-border p-6"
                    >
                      <h3 className="font-display text-xl mb-3">{scholarship.name}</h3>
                      <p className="text-body mb-4">{scholarship.description}</p>
                      {scholarship.eligibilityRequirements && (
                        <div className="mb-4">
                          <h4 className="font-bold text-sm mb-2">Eligibility:</h4>
                          <ul className="text-sm text-body space-y-1">
                            {scholarship.eligibilityRequirements
                              .split("\n")
                              .map((req: string, i: number) => (
                                <li key={i}>• {req}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                      {scholarship.applicationDeadline && (
                        <p className="text-sm text-body">
                          <strong>Deadline:</strong>{" "}
                          {new Date(scholarship.applicationDeadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* University Merit Scholarships */}
            {universityScholarships.length > 0 && (
              <div>
                <h2 className="text-h2 mb-6">University Merit Scholarships</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {universityScholarships.map((scholarship: any) => (
                    <div
                      key={scholarship._id}
                      className="bg-white rounded-card border border-border p-6"
                    >
                      <h3 className="font-display text-lg mb-2">{scholarship.name}</h3>
                      <p className="text-body text-sm mb-4">{scholarship.description}</p>
                      {scholarship.coveragePercentage && (
                        <p className="text-sm font-bold text-navy">
                          {scholarship.coveragePercentage}% tuition covered
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scholarships.length === 0 && (
              <p className="text-body">No scholarships available yet. Check back soon!</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
