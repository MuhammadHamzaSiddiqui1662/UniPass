import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import EligibilityCheck, { type BursCriteria } from "@/components/scholarships/EligibilityCheck";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { connectDB, Scholarship, SiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scholarships for studying in Turkey | UniPass",
  description:
    "Türkiye Bursları is the Turkish government scholarship. Many universities also reduce tuition for strong marks.",
  openGraph: {
    title: "Scholarships for studying in Turkey | UniPass",
    description:
      "What Türkiye Bursları usually covers, the published eligibility guide, and university merit scholarships.",
    type: "website",
    locale: "en_PK",
    siteName: "UniPass",
  },
};

const DEFAULT_CRITERIA: BursCriteria[] = [
  { level: "Bachelor's", ageLimit: 21, minMarks: 70 },
  { level: "Master's", ageLimit: 30, minMarks: 75 },
  { level: "PhD", ageLimit: 35, minMarks: 75 },
];

const DEFAULT_COVERAGE = [
  "Tuition",
  "Housing",
  "Monthly allowance",
  "Health insurance",
  "Turkish language year",
  "Flight ticket",
];

const PORTAL_URL = "https://www.turkiyeburslari.gov.tr/";

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

type MeritRow = { name: string; detail: string; href?: string };

async function loadScholarships() {
  const fallback = {
    coverage: DEFAULT_COVERAGE,
    criteria: DEFAULT_CRITERIA,
    portalUrl: PORTAL_URL,
    lastChecked: "October 2026",
    merit: [] as MeritRow[],
  };
  try {
    await withTimeout(connectDB(), 2500);
    const [scholarships, settings] = await Promise.all([
      withTimeout(Scholarship.find({ status: "published" }).sort({ type: 1, name: 1 }).lean(), 2500),
      withTimeout(SiteSettings.findOne().lean(), 2500).catch(() => null),
    ]);
    const burs = scholarships.find((item) => item.type === "turkiye-burslari");
    const criteria =
      settings?.turkiyeBurslariCriteria?.length
        ? settings.turkiyeBurslariCriteria.map((item) => ({
            level: item.level,
            ageLimit: item.ageLimit,
            minMarks: item.minMarks,
          }))
        : DEFAULT_CRITERIA;
    const lastChecked = settings?.lastTurkiyeBurslariUpdate
      ? new Date(settings.lastTurkiyeBurslariUpdate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : fallback.lastChecked;
    const merit = scholarships
      .filter((item) => item.type === "university-merit")
      .map((item) => ({
        name: item.name,
        detail: item.amount || item.coverage?.join(", ") || item.description,
        href: item.externalUrl || undefined,
      }));
    return {
      coverage: burs?.coverage?.length ? burs.coverage : DEFAULT_COVERAGE,
      criteria,
      portalUrl: burs?.externalUrl || PORTAL_URL,
      lastChecked,
      merit,
    };
  } catch (error) {
    console.error("Failed to fetch scholarships:", error);
    return fallback;
  }
}

function CheckItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 text-[17px] text-primary-900">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-success-tint">
        <svg viewBox="0 0 12 10" className="h-[10px] w-[12px]" aria-hidden="true">
          <path d="M1.2 5.2L4.7 8.7L11.2 1.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </li>
  );
}

export default async function ScholarshipsPage() {
  const data = await loadScholarships();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Scholarships", url: `${baseUrl}/scholarships` },
        ]}
      />
      <Header activeLink="/scholarships" />
      <main>
        <section className="relative min-h-[244px] overflow-hidden bg-primary-900 pb-8">
          <img
            src="/universities/top-visual__imgGroup1.svg"
            alt=""
            className="pointer-events-none absolute max-w-none"
            style={{ width: 1536, height: 717, left: -50, top: -235 }}
          />
          <img
            src="/universities/top-visual__imgSharedHeroOverlay.svg"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div className="container-1200 relative pt-[92px]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-primary-100">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <span className="font-bold text-white">Scholarships</span>
            </nav>
            <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-white sm:text-[38px]">
              Scholarships for studying in Turkey
            </h1>
            <p className="mt-3 max-w-[680px] text-[16px] leading-relaxed text-primary-100 sm:text-[17px]">
              Türkiye Bursları is the Turkish government scholarship. Many universities also reduce tuition for strong marks.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 pb-20 pt-8">
          <div className="container-1200">
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <article className="rounded-[20px] border border-slate-200 bg-white px-6 py-7 sm:px-8">
                <h2 className="font-display text-[24px] font-bold text-primary-900">What Türkiye Bursları usually covers</h2>
                <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {data.coverage.map((item) => (
                    <CheckItem key={item} label={item} />
                  ))}
                </ul>
                <div className="mt-6 rounded-[14px] bg-primary-50 px-5 py-4 text-[15px] leading-relaxed text-primary-900">
                  Not eligible? Many private universities reduce tuition for strong marks, and public universities in smaller cities cost less to live in.
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={data.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center rounded-[10px] border border-primary-200 bg-white px-4 text-[15px] font-bold text-primary-900 hover:border-primary"
                  >
                    Official portal
                  </a>
                  <a
                    href="#merit"
                    className="inline-flex h-11 items-center rounded-[10px] border border-primary-200 bg-white px-4 text-[15px] font-bold text-primary-900 hover:border-primary"
                  >
                    University merit scholarships
                  </a>
                </div>
              </article>

              <article className="rounded-[20px] border border-slate-200 bg-white px-6 py-7 sm:px-8">
                <h2 className="font-display text-[24px] font-bold text-primary-900">Eligibility criteria</h2>
                <div className="mt-5 grid grid-cols-[1.3fr_1fr_0.8fr] gap-2 border-b border-slate-200 pb-2 text-[14px] font-bold text-slate-600">
                  <span>Level</span>
                  <span>Age limit</span>
                  <span>Minimum marks</span>
                </div>
                {data.criteria.map((item) => (
                  <div key={item.level} className="grid grid-cols-[1.3fr_1fr_0.8fr] gap-2 border-b border-slate-200 py-3 text-[16px]">
                    <span className="font-bold text-primary-900">{item.level}</span>
                    <span className="text-primary-900">{item.ageLimit} or under</span>
                    <span className="text-primary-900">{item.minMarks}%</span>
                  </div>
                ))}
                <p className="mt-3 text-[13px] text-slate-600">Last checked: {data.lastChecked}. Rules change every year.</p>
                <div className="my-5 border-t border-dashed border-primary-200" />
                <h3 className="font-display text-[16px] font-bold text-primary-900">Check yourself</h3>
                <div className="mt-4">
                  <EligibilityCheck criteria={data.criteria} />
                </div>
              </article>
            </div>

            <div id="merit" className="scroll-mt-28 pt-12">
              <h2 className="font-display text-[26px] font-bold text-primary-900">Merit scholarships by university</h2>
              <p className="mt-3 max-w-[860px] text-[16px] leading-relaxed text-slate-600">
                A sample of tuition reductions private universities offer for strong marks or test scores. Confirm current rates with each university.
              </p>
              {data.merit.length ? (
                <div className="mt-6 overflow-hidden rounded-[16px] border border-slate-200 bg-white">
                  {data.merit.map((item) => (
                    <div key={item.name} className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-bold text-primary-900">{item.name}</p>
                      {item.href ? (
                        <a href={item.href} className="text-[15px] font-bold text-primary" target="_blank" rel="noreferrer">
                          {item.detail}
                        </a>
                      ) : (
                        <p className="text-[15px] text-slate-600">{item.detail}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
