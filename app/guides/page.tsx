import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, Guide } from "@/lib/db";
import {
  fallbackGuides,
  filterGuides,
  GUIDE_CATEGORIES,
  guidesHref,
  type GuideArticle,
  type GuideQuery,
} from "@/lib/guides/catalog";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<GuideQuery>;
}): Promise<Metadata> {
  const query = await searchParams;
  const category = query.category && query.category !== "All" ? query.category : "";
  const title = category
    ? `${category} guides | UniPass`
    : "Guides for studying in Turkey | UniPass";
  const description =
    "Plain-language answers, written for students applying from Pakistan. Applications, visas, costs, scholarships and life in Turkey.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "en_PK", siteName: "UniPass" },
  };
}

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

async function loadGuides(): Promise<GuideArticle[]> {
  try {
    await withTimeout(connectDB(), 2500);
    const docs = await withTimeout(
      Guide.find({ status: "published" }).sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
      2500,
    );
    if (!docs.length) return fallbackGuides;
    return docs.map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      category: guide.category,
      description: guide.description,
      readTime: guide.readTime,
      featured: Boolean(guide.featured),
      content: guide.content,
      createdAt: guide.createdAt ? new Date(guide.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return fallbackGuides;
  }
}

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex h-[26px] w-fit items-center self-start rounded-full bg-primary-50 px-3 text-[13px] font-bold leading-none text-primary">
      {category}
    </span>
  );
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<GuideQuery>;
}) {
  const query = await searchParams;
  const q = query.q?.trim() || "";
  const category = GUIDE_CATEGORIES.includes(query.category as (typeof GUIDE_CATEGORIES)[number])
    ? (query.category as (typeof GUIDE_CATEGORIES)[number])
    : "All";
  const all = await loadGuides();
  const matched = filterGuides(all, { q, category });
  const featured = matched.find((guide) => guide.featured) ?? (category === "All" && !q ? all.find((guide) => guide.featured) : undefined);
  const gridSource = matched.filter((guide) => guide.slug !== featured?.slug);
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(gridSource.length / PAGE_SIZE) || 1);
  const currentPage = Math.min(page, totalPages);
  const guides = gridSource.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <Header activeLink="/guides" />
      <main>
        <section className="relative h-[220px] overflow-hidden bg-primary-900 sm:h-[244px]">
          <img
            src="/guides/skyline.svg"
            alt=""
            className="pointer-events-none absolute left-1/2 top-[-180px] h-[717px] w-[1536px] max-w-none -translate-x-1/2 opacity-90"
          />
          <img src="/guides/overlay.svg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
          <div className="container-1200 relative pt-[88px]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-primary-100">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <span className="font-bold text-white">Guides</span>
            </nav>
            <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-white sm:text-[38px]">
              Guides for studying in Turkey
            </h1>
            <p className="mt-2 max-w-[640px] text-[16px] leading-relaxed text-primary-100 sm:text-[17px]">
              Plain-language answers, written for students applying from Pakistan.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 pb-16 lg:pb-20">
          <div className="container-1200">
            <form action="/guides" className="relative z-10 -mt-7 max-w-[700px]">
              {category !== "All" ? <input type="hidden" name="category" value={category} /> : null}
              <label htmlFor="guide-search" className="sr-only">Search guides</label>
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 16.5L20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                id="guide-search"
                name="q"
                defaultValue={q}
                placeholder='Search guides, for example “visa”'
                className="h-[60px] w-full rounded-[16px] border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-primary-900 shadow-[0_8px_24px_rgba(15,24,56,0.06)] outline-none placeholder:text-slate-600"
              />
            </form>
            <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Guide topics">
              {GUIDE_CATEGORIES.map((item) => {
                const active = item === category;
                return (
                  <Link
                    key={item}
                    href={guidesHref({ q, category: item })}
                    role="tab"
                    aria-selected={active}
                    className={`shrink-0 rounded-full px-4 py-[9px] text-[15px] font-bold ${
                      active ? "bg-primary text-white" : "border border-primary-200 bg-white text-primary-900 hover:border-primary"
                    }`}
                  >
                    {item}
                  </Link>
                );
              })}
            </div>

            {featured ? (
              <article className="mt-6 overflow-hidden rounded-[20px] bg-primary-50 lg:grid lg:min-h-[340px] lg:grid-cols-[46%_1fr]">
                <div className="relative min-h-[200px] lg:min-h-[340px]">
                  <div className="absolute left-1/2 top-[46%] h-[168px] w-[168px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[18px] border border-primary-200" />
                  <div className="absolute left-1/2 top-[46%] h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[14px] border border-primary-200" />
                  <div className="absolute left-[22%] top-[42%] grid h-[52px] w-[52px] -translate-y-1/2 place-items-center rounded-full border border-primary-200">
                    <span className="text-[18px] text-primary-300">A</span>
                  </div>
                  <p className="absolute bottom-5 left-6 rounded-md bg-black/40 px-2.5 py-1 text-[12px] text-white">
                    Guide cover placeholder
                  </p>
                </div>
                <div className="px-6 pb-8 pt-7 sm:px-8 lg:pr-10 lg:pt-8">
                  <p className="text-[13px] font-bold text-primary">Start here</p>
                  <h2 className="mt-3 max-w-[520px] font-display text-[28px] font-bold leading-[1.15] text-primary-900 sm:text-[30px]">
                    {featured.title}
                  </h2>
                  <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-slate-600">{featured.description}</p>
                  {featured.bullets?.length ? (
                    <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                      {featured.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-[15px] text-primary-900">
                          <svg viewBox="0 0 12 10" className="mt-1 h-[10px] w-[12px] shrink-0" aria-hidden="true">
                            <path d="M1.2 5.1L4.2 8.1L10.8 1.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-5">
                    <Link href={`/guides/${featured.slug}`} className="inline-flex h-12 items-center justify-center rounded-[10px] bg-primary px-6 text-[16px] font-bold text-white hover:bg-primary-700">
                      Read the complete guide
                    </Link>
                    <span className="text-[14px] text-slate-600">{featured.readTime} min read</span>
                  </div>
                </div>
              </article>
            ) : null}

            <div className="mt-10 flex items-end justify-between gap-4">
              <h2 className="font-display text-[26px] font-bold text-primary-900">All guides</h2>
              <p className="text-[15px] text-slate-600">
                {gridSource.length} {gridSource.length === 1 ? "guide" : "guides"}
              </p>
            </div>

            {guides.length === 0 ? (
              <div className="mt-6 rounded-[16px] border border-slate-200 bg-white px-6 py-10">
                <p className="text-[16px] text-primary-900">No guides match that search.</p>
                <Link href="/guides" className="mt-3 inline-block text-[15px] font-bold text-primary">
                  Clear search
                </Link>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {guides.map((guide) => (
                  <article key={guide.slug} className="flex flex-col rounded-[16px] border border-slate-200 bg-white px-6 pb-5 pt-6 md:min-h-[400px] md:pt-6">
                    <div className="hidden h-[132px] md:block" />
                    <CategoryChip category={guide.category} />
                    <h3 className="mt-4 font-display text-[20px] font-bold leading-[1.25] text-primary-900">{guide.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{guide.description}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-[14px]">
                      <span className="text-slate-600">{guide.readTime} min read</span>
                      <Link href={`/guides/${guide.slug}`} className="inline-flex h-9 items-center rounded-full border border-primary-200 px-4 text-[14px] font-bold text-primary-900 hover:border-primary">
                        Read guide
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <nav aria-label="Guides pages" className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                  <Link
                    key={item}
                    href={guidesHref({ q, category, page: item })}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={`grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold ${
                      item === currentPage ? "bg-primary text-white" : "border border-slate-200 bg-white text-primary-900"
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
