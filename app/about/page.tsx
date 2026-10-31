import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "About UniPass | Study Abroad Consultancy",
  description: "Learn about UniPass, your trusted advisor for studying at Turkish universities. Expert guidance for Pakistani students.",
  openGraph: {
    title: "About UniPass",
    description: "Your bridge to Turkish education",
    type: "website",
  },
};

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "About", url: `${baseUrl}/about` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-slate-50">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-8">About UniPass</h1>
            
            <div className="prose max-w-3xl">
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                UniPass is your bridge to Turkish education. We help Pakistani students
                navigate the application process for universities in Türkiye, from
                choosing the right program to settling into campus life.
              </p>

              <h2 className="text-h3 mt-12 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                To make studying in Türkiye accessible and straightforward for Pakistani
                students by providing honest guidance, comprehensive support, and expert
                knowledge of the Turkish higher education system.
              </p>

              <h2 className="text-h3 mt-12 mb-4">What We Do</h2>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span>Free consultations to match you with the right universities and programs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span>Complete application support, from documents to submission</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span>Scholarship guidance including Türkiye Bursları applications</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span>Visa application assistance and pre-departure orientation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-success mt-1">✓</span>
                  <span>Ongoing support throughout your academic journey</span>
                </li>
              </ul>

              <h2 className="text-h3 mt-12 mb-4">Why Choose Us</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                We understand the unique needs of Pakistani students and have deep
                knowledge of both Pakistan's educational system and Turkish university
                requirements. Our team provides honest, transparent guidance and never
                promises admission—because universities make those decisions, not us.
              </p>

              <div className="bg-primary/5 p-6 rounded-card mt-12">
                <p className="text-slate-600 leading-relaxed italic">
                  "Universities make all admission decisions. We help you prepare a
                  complete application and never promise a place."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
