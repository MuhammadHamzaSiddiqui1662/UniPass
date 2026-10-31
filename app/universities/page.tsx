import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Asset from "@/components/home/Asset";
import ListingPagination from "@/components/universities/ListingPagination";
import SortSelect from "@/components/universities/SortSelect";
import UniversityCard from "@/components/universities/UniversityCard";
import { connectDB, University } from "@/lib/db";
import {
  FILTER_CITIES,
  FILTER_FIELDS,
  FILTER_LEVELS,
  FILTER_TYPES,
  fallbackUniversities,
  filterCatalog,
  sortCatalog,
  type CatalogUniversity,
  type ListingQuery,
} from "@/lib/universities/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Universities in Türkiye | UniPass",
  description:
    "Browse and compare Turkish universities for Pakistani students. Filter by city, field of study, type and level to find your perfect match.",
  openGraph: {
    title: "Universities in Türkiye | UniPass",
    description:
      "Browse and compare Turkish universities for Pakistani students. Filter by city, field of study, type and level.",
    type: "website",
    locale: "en_PK",
    siteName: "UniPass",
  },
};

const PAGE_SIZE = 9;

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

async function loadUniversities(): Promise<CatalogUniversity[]> {
  try {
    await withTimeout(connectDB(), 3000);
    const docs = await withTimeout(
      University.find({ status: "published" }).lean(),
      3000,
    );
    if (!docs.length) return fallbackUniversities;
    return docs.map((university) => ({
      _id: String(university._id),
      slug: university.slug,
      name: university.name,
      type: university.type,
      city: university.city,
      fields: university.fields ?? [],
      levels: university.levels ?? [],
      tuitionFrom: university.tuitionFrom,
      hasMeritScholarship: Boolean(university.hasMeritScholarship),
      featuredImage: university.featuredImage,
    }));
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return fallbackUniversities;
  }
}

function queryWithout(
  query: ListingQuery,
  key?: keyof ListingQuery,
): Record<string, string | undefined> {
  const next: Record<string, string | undefined> = {
    city: query.city,
    field: query.field,
    type: query.type,
    level: query.level,
    sort: query.sort,
  };
  if (key) delete next[key];
  return next;
}

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<ListingQuery>;
}) {
  const query = await searchParams;
  const all = await loadUniversities();
  const filtered = sortCatalog(filterCatalog(all, query), query.sort || "tuition-low");
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const universities = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const chips = (
    [
      ["city", query.city],
      ["field", query.field],
      ["type", query.type],
      ["level", query.level],
    ] as const
  ).flatMap(([key, value]) =>
    value && value !== "all" ? [{ key, value: key === "type" ? labelForType(value) : value }] : [],
  );

  return (
    <>
      <Header activeLink="/universities" />
      <main>
        <section className="relative h-[246px] overflow-hidden bg-primary-900">
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
            width={1440}
            height={246}
            className="pointer-events-none absolute left-1/2 top-0 h-[246px] w-[1440px] max-w-none -translate-x-1/2 min-[1440px]:left-0 min-[1440px]:h-full min-[1440px]:w-full min-[1440px]:translate-x-0"
          />
        </section>

        <section className="bg-slate-50 pb-16 pt-[46px]">
          <div className="container-1200">
            <form
              action="/universities"
              method="get"
              className="rounded-panel border-[1.2px] border-slate-200 bg-white px-6 py-4 sm:px-8"
            >
              {query.sort ? <input type="hidden" name="sort" value={query.sort} /> : null}
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-[216px_216px_216px_216px_208px] xl:gap-x-4">
                <FilterSelect label="City" name="city" value={query.city || "all"}>
                  <option value="all">All cities</option>
                  {FILTER_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect label="Field of study" name="field" value={query.field || "all"}>
                  <option value="all">All fields</option>
                  {FILTER_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect label="University type" name="type" value={query.type || "all"}>
                  <option value="all">All types</option>
                  {FILTER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect label="Level of study" name="level" value={query.level || "all"}>
                  <option value="all">All levels</option>
                  {FILTER_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </FilterSelect>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-input bg-secondary text-[15px] font-bold text-primary-900 transition-colors hover:bg-secondary-500 xl:w-[208px]"
                >
                  Apply filters
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[20px] font-bold leading-[26px] text-primary-900">
                {filtered.length} {filtered.length === 1 ? "university" : "universities"} found
              </h1>
              <SortSelect sort={query.sort} query={query} />
            </div>

            {chips.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {chips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={chipHref(query, chip.key)}
                    className="chip-tint gap-1.5 font-bold"
                  >
                    {chip.value} ×
                  </Link>
                ))}
                <Link
                  href="/universities"
                  className="text-[15px] font-bold text-primary hover:underline"
                >
                  Clear all
                </Link>
              </div>
            )}

            {universities.length === 0 ? (
              <div className="mt-10 rounded-card border border-slate-200 bg-white px-6 py-16 text-center">
                <p className="text-[18px] text-slate-600">No universities found matching your criteria.</p>
                <Link href="/universities" className="btn-primary mt-6">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {universities.map((university) => (
                  <UniversityCard key={university.slug} university={university} />
                ))}
              </div>
            )}

            <ListingPagination
              page={currentPage}
              totalPages={totalPages}
              query={{
                city: query.city,
                field: query.field,
                type: query.type,
                level: query.level,
                sort: query.sort,
                cleared: query.cleared,
              }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function labelForType(value: string) {
  return FILTER_TYPES.find((type) => type.value === value)?.label || value;
}

function chipHref(query: ListingQuery, key: string) {
  const params = new URLSearchParams();
  Object.entries(queryWithout(query, key as keyof ListingQuery)).forEach(([name, value]) => {
    if (value && name !== "cleared") params.set(name, value);
  });
  const search = params.toString();
  return search ? `/universities?${search}` : "/universities";
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-600">{label}</span>
      <span className="relative block">
        <select
          name={name}
          defaultValue={value}
          className="h-11 w-full appearance-none rounded-input border-[1.5px] border-primary-200 bg-white pl-4 pr-10 text-[16px] text-primary-900 outline-none focus:border-primary"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <Asset src="/universities/filter-bar__imgVector2.svg" width={12} height={7} />
        </span>
      </span>
    </label>
  );
}
