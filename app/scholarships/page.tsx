import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ScorecardCalculator from "@/components/scholarships/ScorecardCalculator";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { loadPublishedScorecard } from "@/lib/scholarships/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scholarship eligibility scorecard | UniPass",
  description:
    "Score an MPhil or PhD profile against accessible, competitive, and elite scholarships, then see matching routes and countries.",
  openGraph: {
    title: "Scholarship eligibility scorecard | UniPass",
    description:
      "A weighted scorecard for Pakistani applicants: gates, funding-route fit, and country-by-country probability.",
    type: "website",
    locale: "en_PK",
    siteName: "UniPass",
  },
};

export default async function ScholarshipsPage() {
  const data = await loadPublishedScorecard();
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
            width={1536}
            height={717}
            className="pointer-events-none absolute max-w-none"
            style={{
              width: "max(1536px, 106.6667vw)",
              height: "max(717px, 49.7917vw)",
              left: "min(-50px, -3.4722vw)",
              top: "min(-235px, -16.3194vw)",
            }}
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
              Scholarship eligibility scorecard
            </h1>
            <p className="mt-3 max-w-[720px] text-[16px] leading-relaxed text-primary-100 sm:text-[17px]">
              For MPhil and PhD applicants from Pakistan. Enter your profile and see a 0–100 score at three levels, which gates you pass, which funding routes fit, and how the picture changes by country.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 pb-20 pt-8">
          <div className="container-1200">
            <ScorecardCalculator config={data.config} routes={data.routes} countries={data.countries} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
