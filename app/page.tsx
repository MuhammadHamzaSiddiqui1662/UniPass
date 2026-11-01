import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { OrganizationSchema, FAQSchema } from "@/components/seo/StructuredData";
import {
  AdmissionSteps,
  BookConsultation,
  Guides,
  Hero,
  Questions,
  Scholarships,
  Universities,
} from "@/components/home/HomeSections";
import Testimonials from "@/components/home/Testimonials";
import { connectDB, FAQ, Guide, Testimonial, University } from "@/lib/db";
import {
  CAMPUS_PHOTOS,
  fallbackFaqs,
  fallbackGuides,
  fallbackTestimonials,
  fallbackUniversities,
  GUIDE_TOTAL_FALLBACK,
  TESTIMONIAL_TOTAL_FALLBACK,
  UNIVERSITY_TOTAL_FALLBACK,
  type HomeFaq,
  type HomeGuide,
  type HomeTestimonial,
  type HomeUniversity,
} from "@/lib/home/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UniPass | Your degree in Türkiye starts here",
  description:
    "Compare universities, understand scholarships and get help with every step, from Pakistan to your first day on campus.",
  keywords: [
    "study in turkey",
    "turkish universities",
    "pakistan students",
    "scholarships",
    "study abroad",
    "turkiye burslari",
    "unipass",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "UniPass",
    title: "UniPass | Your degree in Türkiye starts here",
    description:
      "Compare universities, understand scholarships and get help with every step, from Pakistan to your first day on campus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniPass | Your degree in Türkiye starts here",
    description:
      "Compare universities, understand scholarships and get help with every step, from Pakistan to your first day on campus.",
  },
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("database timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function guideArt(category: string, index: number): HomeGuide["art"] {
  const value = category.toLowerCase();
  if (value.includes("visa") || value.includes("arrival")) return "visa";
  if (value.includes("money") || value.includes("cost")) return "money";
  if (value.includes("apply")) return "document";
  return (["document", "visa", "money"] as const)[index % 3];
}

async function getHomePageData() {
  try {
    await withTimeout(connectDB(), 3000);

    const [featured, published, universityCount, guides, guideCount, faqs, testimonials, testimonialCount] =
      await withTimeout(
        Promise.all([
          University.find({ status: "published", featuredOnHome: true }).sort({ homeOrder: 1, name: 1 }).lean(),
          University.find({ status: "published" }).sort({ homeOrder: 1, name: 1 }).limit(3).lean(),
          University.countDocuments({ status: "published" }),
          Guide.find({ status: "published" }).sort({ order: 1 }).limit(3).lean(),
          Guide.countDocuments({ status: "published" }),
          FAQ.find({ status: "published" }).sort({ order: 1 }).limit(6).lean(),
          Testimonial.find({ status: "published" }).sort({ order: 1 }).limit(9).lean(),
          Testimonial.countDocuments({ status: "published" }),
        ]),
        3000,
      );

    const universities = featured.length > 0 ? featured : published;
    const universityCards: HomeUniversity[] =
      universities.length > 0
        ? universities.map((university, index) => ({
            slug: university.slug,
            name: university.name,
            type: university.type,
            city: university.city,
            country: university.country || "Türkiye",
            countryCode: university.countryCode || "TR",
            fields: university.fields ?? [],
            levels: university.levels ?? [],
            tuitionFrom: university.tuitionFrom,
            image: university.featuredImage || CAMPUS_PHOTOS[index % CAMPUS_PHOTOS.length],
          }))
        : fallbackUniversities;

    const guideCards: HomeGuide[] =
      guides.length > 0
        ? guides.map((guide, index) => ({
            slug: guide.slug,
            title: guide.title,
            category: guide.category,
            description: guide.description,
            readTime: guide.readTime,
            art: guideArt(guide.category, index),
          }))
        : fallbackGuides;

    const faqCards: HomeFaq[] =
      faqs.length > 0
        ? faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
        : fallbackFaqs;

    const stories: HomeTestimonial[] =
      testimonials.length > 0
        ? testimonials.map((story) => ({
            quote: story.quote,
            initials: story.initials,
            name: story.studentName,
            origin: story.origin,
            university: story.university,
            sample: false,
          }))
        : fallbackTestimonials;

    return {
      universities: universityCards,
      universityTotal: universities.length > 0 ? universityCount : UNIVERSITY_TOTAL_FALLBACK,
      guides: guideCards,
      guideTotal: guides.length > 0 ? guideCount : GUIDE_TOTAL_FALLBACK,
      faqs: faqCards,
      testimonials: stories,
      testimonialTotal:
        testimonials.length > 0 ? testimonialCount : TESTIMONIAL_TOTAL_FALLBACK,
    };
  } catch (error) {
    console.error("Failed to fetch home page data:", error);
    return {
      universities: fallbackUniversities,
      universityTotal: UNIVERSITY_TOTAL_FALLBACK,
      guides: fallbackGuides,
      guideTotal: GUIDE_TOTAL_FALLBACK,
      faqs: fallbackFaqs,
      testimonials: fallbackTestimonials,
      testimonialTotal: TESTIMONIAL_TOTAL_FALLBACK,
    };
  }
}

export default async function Home() {
  const data = await getHomePageData();

  return (
    <>
      <OrganizationSchema />
      <FAQSchema faqs={data.faqs} />
      <Header />
      <main>
        <Hero />
        <Universities universities={data.universities} total={data.universityTotal} />
        <Scholarships />
        <AdmissionSteps />
        <Testimonials testimonials={data.testimonials} total={data.testimonialTotal} />
        <Guides guides={data.guides} total={data.guideTotal} />
        <BookConsultation />
        <Questions faqs={data.faqs} />
      </main>
      <Footer />
    </>
  );
}
