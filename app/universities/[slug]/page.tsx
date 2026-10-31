import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CampusGallery from "@/components/universities/CampusGallery";
import UniversityActions from "@/components/universities/UniversityActions";
import { BreadcrumbSchema, UniversitySchema } from "@/components/seo/StructuredData";
import { connectDB, University } from "@/lib/db";
import { whatsappHref } from "@/lib/site/contact";
import {
  fallbackDetail,
  scholarshipLabel,
  type DetailUniversity,
} from "@/lib/universities/details";
import { formatCurrency } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

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

async function getUniversity(slug: string): Promise<DetailUniversity | null> {
  const sample = fallbackDetail(slug);
  try {
    await withTimeout(connectDB(), 3000);
    const university = await withTimeout(
      University.findOne({ slug, status: "published" }).lean(),
      3000,
    );
    if (!university) return sample;
    return {
      _id: String(university._id),
      slug: university.slug,
      name: university.name,
      type: university.type,
      city: university.city,
      tuitionFrom: university.tuitionFrom,
      fields: university.fields ?? [],
      levels: university.levels ?? [],
      description: university.description || sample?.description || "",
      whyChoose: university.whyChoose || sample?.whyChoose || "",
      programsInfo: university.programsInfo || sample?.programsInfo || "",
      campusLife: university.campusLife || sample?.campusLife || "",
      turkiyeBurslariEligible: university.turkiyeBurslariEligible,
      hasMeritScholarship: university.hasMeritScholarship,
      metaTitle: university.metaTitle,
      metaDescription: university.metaDescription,
    };
  } catch (error) {
    console.error("Failed to fetch university:", error);
    return sample;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const university = await getUniversity(slug);
  if (!university) return { title: "University not found | UniPass" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  const title = university.metaTitle || `${university.name} | Study in Türkiye | UniPass`;
  const description =
    university.metaDescription ||
    university.description ||
    `Explore ${university.name} in ${university.city} with UniPass.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/universities/${university.slug}`,
      type: "website",
      locale: "en_PK",
      siteName: "UniPass",
    },
  };
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const university = await getUniversity(slug);
  if (!university) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  const bookmarkId = university._id || university.slug;
  const whatsapp = whatsappHref();

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
      <Header activeLink="/universities" />
      <main className="bg-page-bg">
        <div className="container-1200 pb-16 pt-[104px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-[14px] text-body">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="px-2">/</span>
            <Link href="/universities" className="hover:text-ink">
              Universities
            </Link>
            <span className="px-2">/</span>
            <span className="font-bold text-ink">{university.name}</span>
          </nav>

          <CampusGallery name={university.name} />

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h1 className="font-display text-[32px] leading-tight text-ink sm:text-[36px]">
              {university.name}
            </h1>
            <UniversityActions id={bookmarkId} name={university.name} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={university.type === "public" ? "chip-success" : "chip-tint"}>
              {university.type === "public" ? "Public" : "Private"}
            </span>
            <span className="chip-outline">{university.city}</span>
          </div>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="max-w-[680px] space-y-8">
              <section>
                <h2 className="font-display text-[24px] text-ink">About {university.name}</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-body">{university.description}</p>
              </section>
              <section>
                <h2 className="font-display text-[24px] text-ink">Why students choose it</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-body">{university.whyChoose}</p>
              </section>
              <section>
                <h2 className="font-display text-[24px] text-ink">Programs and fields</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-body">{university.programsInfo}</p>
              </section>
              <section>
                <h2 className="font-display text-[24px] text-ink">Campus and student life</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-body">{university.campusLife}</p>
              </section>
            </div>

            <aside className="rounded-card border-[1.2px] border-border bg-white px-7 py-6">
              <h2 className="font-display text-[20px] text-ink">Key facts</h2>
              <dl className="mt-4">
                <Fact label="Type" value={university.type === "public" ? "Public" : "Private"} />
                <Fact label="City" value={university.city} />
                <Fact label="Tuition from" value={`${formatCurrency(university.tuitionFrom)} a year (sample)`} />
                <Fact label="Levels" value={university.levels.join(", ")} />
                <Fact label="Fields" value={university.fields.join(", ")} />
                <Fact label="Scholarships" value={scholarshipLabel(university)} last />
              </dl>
              <div className="mt-5 space-y-3">
                <Link
                  href="/#book"
                  className="inline-flex h-[50px] w-full items-center justify-center rounded-input bg-cta-red text-[16px] font-bold text-white hover:bg-cta-red/90"
                >
                  Book free consultation
                </Link>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[50px] w-full items-center justify-center rounded-input bg-whatsapp-green text-[16px] font-bold text-white hover:bg-whatsapp-green/90"
                >
                  Message on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>

        <section className="bg-navy">
          <div className="container-1200 py-14 lg:py-16">
            <h2 className="font-display text-[26px] leading-snug text-white sm:text-[30px]">
              Ready to apply to {university.name}?
            </h2>
            <p className="mt-3 text-[16px] text-on-dark-muted">
              Talk to an advisor for 20 minutes. It is free.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#book"
                className="inline-flex h-12 items-center justify-center rounded-input bg-white px-6 text-[16px] font-bold text-ink hover:bg-white/90"
              >
                Book free consultation
              </Link>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-input border-[1.5px] border-white/70 px-5 text-[15px] font-bold text-white hover:bg-white/10"
              >
                Message on WhatsApp instead
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Fact({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={last ? "pt-4" : "border-b border-border py-4 first:pt-2"}>
      <dt className="text-[13px] font-bold text-body">{label}</dt>
      <dd className="mt-1 text-[15px] text-ink">{value}</dd>
    </div>
  );
}
