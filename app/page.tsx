import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ConsultationForm from "@/components/public/ConsultationForm";
import Link from "next/link";
import { connectDB, University, Guide, FAQ, Testimonial } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/format";
import { Metadata } from "next";
import { OrganizationSchema, FAQSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "UniPass | Your degree in Türkiye starts here",
  description:
    "Expert guidance for Pakistani students applying to Turkish universities. Free consultation, scholarship info, and full application support from application to arrival.",
};

async function getHomePageData() {
  try {
    await connectDB();

    const [universities, guides, faqs, testimonials] = await Promise.all([
      University.find({ status: "published" }).limit(3).lean(),
      Guide.find({ status: "published" }).sort({ order: 1 }).limit(3).lean(),
      FAQ.find({ status: "published" }).sort({ order: 1 }).limit(6).lean(),
      Testimonial.find({ status: "published" })
        .sort({ order: 1 })
        .limit(3)
        .lean(),
    ]);

    return {
      universities: JSON.parse(JSON.stringify(universities)),
      guides: JSON.parse(JSON.stringify(guides)),
      faqs: JSON.parse(JSON.stringify(faqs)),
      testimonials: JSON.parse(JSON.stringify(testimonials)),
    };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return {
      universities: [],
      guides: [],
      faqs: [],
      testimonials: [],
    };
  }
}

export default async function Home() {
  const { universities, guides, faqs, testimonials } = await getHomePageData();

  return (
    <>
      <OrganizationSchema />
      {faqs.length > 0 && <FAQSchema faqs={faqs} />}
      <Header activeLink="/" />

      <main>
        {/* Hero Section */}
        <section
          className="relative min-h-[716px] flex items-center justify-center text-white bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/rendered/hero-background-landing-1440x716.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,14,36,0.88)] via-[rgba(8,14,36,0.55)] to-[rgba(8,14,36,0.06)]" />
          <div className="relative z-10 container-1200 py-32 md:py-40">
            <h1 className="text-h1-hero font-bold mb-8 max-w-[652px]">
              Your degree in Türkiye<br />starts here
            </h1>
            <p className="text-[20px] leading-[30px] text-on-dark-muted mb-10 max-w-[490px]">
              Compare universities, understand scholarships and get help with
              every step, from Pakistan to your first day on campus.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/universities"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-ink font-bold rounded-input text-[17px] hover:bg-gray-100 transition-colors h-[52px]"
              >
                Explore universities
              </Link>
              <Link
                href="/#book"
                className="btn-outline-dark h-[52px] px-8 text-[17px]"
              >
                Book free consultation
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-[17px]">
              {[
                "Free first consultation",
                "Scholarships explained",
                "Support from application to arrival",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-teal-light flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 12 10"
                  >
                    <path d="M1 5l3 3 7-7" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Universities Section */}
        <section className="py-20 bg-page-bg">
          <div className="container-1200">
            <h2 className="text-h2 mb-4">Explore universities in Türkiye</h2>
            <p className="text-[18px] leading-[28px] text-body mb-12 max-w-[548px]">
              A preview of the full list. Filter by city, field and university
              type on the dedicated page.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {universities.map((uni: any) => (
                <Link
                  key={uni._id}
                  href={`/universities/${uni.slug}`}
                  className="group bg-white border-[1.2px] border-border rounded-card overflow-hidden hover:border-navy transition-colors"
                >
                  <div
                    className="h-[190px] bg-cover bg-center relative"
                    style={{
                      backgroundImage:
                        "url('/assets/figma/landing--section-universities--university-card--52-568.png')",
                    }}
                  >
                    <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-xs px-4 py-1">
                      Campus photo placeholder
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex gap-2 mb-3">
                      <span
                        className={
                          uni.type === "public"
                            ? "chip-success"
                            : "chip-tint"
                        }
                      >
                        {uni.type === "public" ? "Public" : "Private"}
                      </span>
                      <span className="chip-outline">{uni.city}</span>
                    </div>
                    <h3 className="font-display text-[20px] mb-4 text-ink group-hover:text-navy transition-colors">
                      {uni.name}
                    </h3>
                    <div className="text-sm text-body space-y-1 mb-4">
                      <p>Fields: {uni.fields.join(", ")}</p>
                      <p>Levels: {uni.levels.join(", ")}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-[13px] text-body mb-1">Tuition from</p>
                      <p className="font-display text-[28px] text-ink">
                        {formatCurrency(uni.tuitionFrom)}
                      </p>
                      <p className="text-[13px] text-body">
                        a year (sample)
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <p className="text-[16px] text-ink mb-6">
                Showing {universities.length} of 8 universities
              </p>
              <Link href="/universities" className="btn-primary h-[54px] px-12">
                View all universities
              </Link>
            </div>
          </div>
        </section>

        {/* Scholarships Section */}
        <section className="py-20 bg-surface-tint">
          <div className="container-1200">
            <div className="bg-white rounded-form-card p-8 lg:p-12 border-[1.2px] border-border flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-[32px] leading-[38px] font-display mb-4">
                  Scholarships that can cover your studies
                </h2>
                <p className="text-[18px] leading-[28px] text-body mb-6">
                  Türkiye Bursları can cover tuition, housing and more. Many
                  universities also reduce tuition for strong marks.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["Tuition", "Housing", "Monthly allowance", "Health insurance"].map(
                    (item) => (
                      <span key={item} className="chip-success">
                        {item}
                      </span>
                    )
                  )}
                </div>
                <Link
                  href="/scholarships"
                  className="btn-cta h-[52px] px-10"
                >
                  Check scholarship eligibility
                </Link>
              </div>
              <div className="lg:w-[480px] bg-surface-tint rounded-panel p-8 flex flex-col items-center justify-center text-center">
                <p className="text-[20px] text-navy mb-2">Up to</p>
                <p className="text-[58px] font-display text-navy leading-none mb-2">
                  100%
                </p>
                <p className="text-[16px] text-body">
                  tuition covered by Türkiye Bursları
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Admission Steps Section */}
        <section id="admission-steps" className="py-20 bg-white">
          <div className="container-1200">
            <h2 className="text-h2 mb-4 max-w-[699px]">
              Five steps from Pakistan to your first class
            </h2>
            <p className="text-[18px] leading-[28px] text-body mb-16">
              You do not have to work out the order alone.
            </p>

            <div className="relative">
              {[
                {
                  num: 1,
                  title: "Free consultation",
                  desc: ["Share your marks and goals.", "Leave with a shortlist."],
                  duration: "Day 1",
                },
                {
                  num: 2,
                  title: "Check eligibility",
                  desc: [
                    "Confirm which exam each",
                    "university accepts.",
                  ],
                  duration: "1 to 2 weeks",
                },
                {
                  num: 3,
                  title: "Prepare and apply",
                  desc: [
                    "Documents reviewed,",
                    "applications submitted.",
                  ],
                  duration: "2 to 6 weeks",
                },
                {
                  num: 4,
                  title: "Offer and visa",
                  desc: [
                    "Accept an offer, then apply",
                    "for the student visa.",
                  ],
                  duration: "4 to 8 weeks",
                },
                {
                  num: 5,
                  title: "Arrive and settle",
                  desc: [
                    "Residence permit, housing",
                    "and orientation.",
                  ],
                  duration: "First month",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="relative flex gap-8 mb-16 last:mb-0"
                >
                  <div className="flex-shrink-0">
                    <div className="w-11 h-11 bg-navy rounded-full flex items-center justify-center text-white font-display text-[20px]">
                      {step.num}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-display text-[20px] mb-2">
                      {step.title}
                    </h3>
                    {step.desc.map((line, j) => (
                      <p key={j} className="text-[15px] text-body leading-relaxed">
                        {line}
                      </p>
                    ))}
                    <span className="inline-block mt-3 chip-outline">
                      {step.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guides Section */}
        <section className="py-20 bg-white">
          <div className="container-1200">
            <h2 className="text-h2 mb-4">Guides for studying in Turkey</h2>
            <p className="text-[18px] leading-[28px] text-body mb-12">
              Plain-language answers, written for students applying from
              Pakistan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {guides.map((guide: any) => (
                <div
                  key={guide._id}
                  className="bg-white border-[1.2px] border-border rounded-card overflow-hidden"
                >
                  <div className="h-[160px] bg-surface-tint" />
                  <div className="p-5">
                    <span className="chip-tint mb-3">{guide.category}</span>
                    <h3 className="font-display text-[20px] mb-3 text-ink leading-tight">
                      {guide.title}
                    </h3>
                    <p className="text-[15px] text-body mb-4 leading-relaxed">
                      {guide.description}
                    </p>
                    <div className="border-t border-border pt-4 flex items-center justify-between">
                      <span className="text-[13px] text-body">
                        {guide.readTime} min read
                      </span>
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="btn-outline text-sm px-4 py-2"
                      >
                        Read guide
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-[16px] text-ink mb-6">
                Showing {guides.length} of 15 guides
              </p>
              <Link href="/guides" className="btn-primary h-[54px] px-12">
                View all guides
              </Link>
            </div>
          </div>
        </section>

        {/* Book Consultation Section */}
        <section id="book" className="py-20 bg-navy">
          <div className="container-1200">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h2 className="text-h2-cta mb-6">
                  Talk to an advisor<br />for 20 minutes.<br />It is free.
                </h2>
                <div className="space-y-4 mb-8">
                  {[
                    "A shortlist matched to your marks and budget",
                    "A clear list of documents you need",
                    "Honest advice on which scholarships fit",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-teal-light flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 12 10"
                      >
                        <path d="M1 5l3 3 7-7" />
                      </svg>
                      <span className="text-[18px]">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="https://wa.me/PLACEHOLDER" className="btn-outline-dark">
                  Message on WhatsApp instead
                </a>
              </div>
              <div>
                <ConsultationForm />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-page-bg">
          <div className="container-1200">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-h2 mb-4">
                  Questions<br />students ask<br />most
                </h2>
                <p className="text-[18px] leading-[28px] text-body mb-8">
                  Cannot find your answer? Ask us on WhatsApp and we will reply.
                </p>
                <a
                  href="https://wa.me/PLACEHOLDER"
                  className="btn-whatsapp"
                >
                  Ask on WhatsApp
                </a>
              </div>
              <div className="space-y-0">
                {faqs.map((faq: any, i: number) => (
                  <details key={faq._id} className="group border-t-[1.5px] border-border-strong">
                    <summary className="flex items-start justify-between gap-4 py-6 cursor-pointer list-none">
                      <h3 className="font-display text-[20px] text-ink flex-1">
                        {faq.question}
                      </h3>
                      <span className="text-2xl text-ink group-open:hidden">+</span>
                      <span className="text-2xl text-ink hidden group-open:block">−</span>
                    </summary>
                    <div className="pb-6 text-[16px] leading-[26px] text-body">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
