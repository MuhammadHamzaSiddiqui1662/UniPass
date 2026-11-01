import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CampusGallery from "@/components/universities/CampusGallery";
import SmartImage from "@/components/media/SmartImage";
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
      logo: university.logo || undefined,
      logoAlt: university.logoAlt || undefined,
      featuredImage: university.featuredImage || undefined,
      featuredImageAlt: university.featuredImageAlt || undefined,
      gallery: (university.gallery || []).filter(Boolean),
      galleryAlts: university.galleryAlts || [],
      ogImage: university.ogImage || undefined,
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

  const image = absoluteImage(baseUrl, university.ogImage || university.featuredImage);

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
      images: image ? [{ url: image, alt: university.featuredImageAlt || university.name }] : undefined,
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
  const campusImages = campusShots(university);

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
      <main className="bg-slate-50">
        <div className="container-1200 pb-16 pt-[104px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-[14px] text-slate-600">
            <Link href="/" className="hover:text-primary-900">
              Home
            </Link>
            <span className="px-2">/</span>
            <Link href="/universities" className="hover:text-primary-900">
              Universities
            </Link>
            <span className="px-2">/</span>
            <span className="font-bold text-primary-900">{university.name}</span>
          </nav>

          <CampusGallery name={university.name} images={campusImages} />

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              {university.logo && (
                <SmartImage
                  src={university.logo}
                  alt={university.logoAlt || `${university.name} logo`}
                  fill={false}
                  width={72}
                  height={72}
                  sizes="72px"
                  className="h-[72px] w-[72px] rounded-xl border border-slate-200 bg-white object-contain"
                />
              )}
              <h1 className="font-display text-[32px] leading-tight text-primary-900 sm:text-[36px]">
                {university.name}
              </h1>
            </div>
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
                <h2 className="font-display text-[24px] text-primary-900">About {university.name}</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-slate-600">{university.description}</p>
              </section>
              <section>
                <h2 className="font-display text-[24px] text-primary-900">Why students choose it</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-slate-600">{university.whyChoose}</p>
              </section>
              <section>
                <h2 className="font-display text-[24px] text-primary-900">Programs and fields</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-slate-600">{university.programsInfo}</p>
              </section>
              <section>
                <h2 className="font-display text-[24px] text-primary-900">Campus and student life</h2>
                <p className="mt-4 text-[16px] leading-[25px] text-slate-600">{university.campusLife}</p>
              </section>
            </div>

            <aside className="rounded-card border-[1.2px] border-slate-200 bg-white px-7 py-6">
              <h2 className="font-display text-[20px] text-primary-900">Key facts</h2>
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
                  className="inline-flex h-[50px] w-full items-center justify-center rounded-input bg-secondary text-[16px] font-bold text-primary-900 hover:bg-secondary-500"
                >
                  Book free consultation
                </Link>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[50px] w-full items-center justify-center rounded-input bg-whatsapp text-[16px] font-bold text-white hover:bg-whatsapp/90"
                >
                  Message on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>

        <section className="bg-primary">
          <div className="container-1200 py-14 lg:py-16">
            <h2 className="font-display text-[26px] leading-snug text-white sm:text-[30px]">
              Ready to apply to {university.name}?
            </h2>
            <p className="mt-3 text-[16px] text-primary-100">
              Talk to an advisor for 20 minutes. It is free.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#book"
                className="inline-flex h-12 items-center justify-center rounded-input bg-white px-6 text-[16px] font-bold text-primary-900 hover:bg-white/90"
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

function campusShots(university: DetailUniversity) {
  const shots: { src: string; alt: string }[] = [];
  const seen = new Set<string>();
  const add = (src?: string, alt?: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    shots.push({ src, alt: alt || `${university.name} campus` });
  };
  add(university.featuredImage, university.featuredImageAlt);
  university.gallery.forEach((src, index) => add(src, university.galleryAlts[index]));
  return shots;
}

function absoluteImage(baseUrl: string, src?: string) {
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${baseUrl}${src}`;
  return undefined;
}

function Fact({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={last ? "pt-4" : "border-b border-slate-200 py-4 first:pt-2"}>
      <dt className="text-[13px] font-bold text-slate-600">{label}</dt>
      <dd className="mt-1 text-[15px] text-primary-900">{value}</dd>
    </div>
  );
}
