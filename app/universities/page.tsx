import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { connectDB, University } from "@/lib/db";
import { formatCurrency } from "@/lib/utils/format";
import { Metadata } from "next";
import {
  CITIES_IN_TURKIYE,
  STUDY_FIELDS,
  STUDY_LEVELS,
  UNIVERSITY_TYPES,
} from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Universities in Türkiye | UniPass",
  description:
    "Browse and compare Turkish universities for Pakistani students. Filter by city, field of study, type and level to find your perfect match.",
};

interface SearchParams {
  city?: string;
  field?: string;
  type?: string;
  level?: string;
  sort?: string;
  page?: string;
}

async function getUniversities(searchParams: SearchParams) {
  try {
    await connectDB();

    const query: any = { status: "published" };
    const page = parseInt(searchParams.page || "1");
    const limit = 9;
    const skip = (page - 1) * limit;

    if (searchParams.city && searchParams.city !== "all") {
      query.city = searchParams.city;
    }

    if (searchParams.type && searchParams.type !== "all") {
      query.type = searchParams.type.toLowerCase();
    }

    if (searchParams.field && searchParams.field !== "all") {
      query.fields = searchParams.field;
    }

    if (searchParams.level && searchParams.level !== "all") {
      query.levels = searchParams.level;
    }

    const sortOptions: any = {};
    if (searchParams.sort === "tuition-low") {
      sortOptions.tuitionFrom = 1;
    } else if (searchParams.sort === "tuition-high") {
      sortOptions.tuitionFrom = -1;
    } else {
      sortOptions.name = 1;
    }

    const [universities, total] = await Promise.all([
      University.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      University.countDocuments(query),
    ]);

    return {
      universities: JSON.parse(JSON.stringify(universities)),
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    return {
      universities: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
    };
  }
}

export default async function UniversitiesPage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await rawSearchParams;
  const { universities, total, currentPage, totalPages } =
    await getUniversities(searchParams);

  const activeFilters = [];
  if (searchParams.city && searchParams.city !== "all")
    activeFilters.push({ key: "city", value: searchParams.city });
  if (searchParams.field && searchParams.field !== "all")
    activeFilters.push({ key: "field", value: searchParams.field });
  if (searchParams.type && searchParams.type !== "all")
    activeFilters.push({ key: "type", value: searchParams.type });
  if (searchParams.level && searchParams.level !== "all")
    activeFilters.push({ key: "level", value: searchParams.level });

  return (
    <>
      <Header activeLink="/universities" />

      <main className="pt-32">
        {/* Intro Band */}
        <section
          className="relative h-[246px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/rendered/intro-band-universities-1440x246.png')",
          }}
        />

        {/* Filters */}
        <section className="py-8 bg-page-bg">
          <div className="container-1200">
            <form className="bg-white rounded-panel p-6 border-[1.2px] border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-[13px] font-bold text-body mb-2">
                    City
                  </label>
                  <select
                    name="city"
                    defaultValue={searchParams.city || "all"}
                    className="input-field h-11"
                  >
                    <option value="all">All cities</option>
                    {CITIES_IN_TURKIYE.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-body mb-2">
                    Field of study
                  </label>
                  <select
                    name="field"
                    defaultValue={searchParams.field || "all"}
                    className="input-field h-11"
                  >
                    <option value="all">All fields</option>
                    {STUDY_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-body mb-2">
                    University type
                  </label>
                  <select
                    name="type"
                    defaultValue={searchParams.type || "all"}
                    className="input-field h-11"
                  >
                    <option value="all">All types</option>
                    {UNIVERSITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-body mb-2">
                    Level of study
                  </label>
                  <select
                    name="level"
                    defaultValue={searchParams.level || "all"}
                    className="input-field h-11"
                  >
                    <option value="all">All levels</option>
                    {STUDY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-cta h-11 px-8">
                Apply filters
              </button>
            </form>
          </div>
        </section>

        {/* Results */}
        <section className="py-12 bg-page-bg">
          <div className="container-1200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="font-display text-[22px]">
                {total} universities found
              </h1>
              <select
                name="sort"
                defaultValue={searchParams.sort || "name"}
                className="input-field w-auto h-11"
                onChange={(e) => {
                  const form = e.target.closest("form");
                  if (form) form.submit();
                }}
              >
                <option value="name">Sort: Name A-Z</option>
                <option value="tuition-low">Sort: Tuition, low to high</option>
                <option value="tuition-high">
                  Sort: Tuition, high to low
                </option>
              </select>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {activeFilters.map((filter) => (
                  <Link
                    key={filter.key}
                    href={{
                      query: {
                        ...searchParams,
                        [filter.key]: undefined,
                      },
                    }}
                    className="chip-tint flex items-center gap-2 hover:bg-navy/10"
                  >
                    {filter.value} ×
                  </Link>
                ))}
                <Link
                  href="/universities"
                  className="text-navy font-bold text-sm hover:underline"
                >
                  Clear all
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {universities.map((uni: any) => (
                <Link
                  key={uni._id}
                  href={`/universities/${uni.slug}`}
                  className="group bg-white border-[1.2px] border-border rounded-card overflow-hidden hover:border-navy transition-colors"
                >
                  <div className="relative">
                    <div
                      className="h-[190px] bg-cover bg-center"
                      style={{
                        backgroundImage:
                          "url('/assets/figma/landing--section-universities--university-card--52-568.png')",
                      }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-xs px-4 py-1">
                        Campus photo placeholder
                      </div>
                    </div>
                    {uni.hasMeritScholarship && (
                      <div className="absolute top-3 left-3 chip-warning">
                        Merit scholarships
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex gap-2 mb-3">
                      <span
                        className={
                          uni.type === "public" ? "chip-success" : "chip-tint"
                        }
                      >
                        {uni.type === "public" ? "Public" : "Private"}
                      </span>
                      <span className="chip-outline">{uni.city}</span>
                    </div>
                    <h2 className="font-display text-[20px] mb-4 text-ink group-hover:text-navy transition-colors">
                      {uni.name}
                    </h2>
                    <div className="text-sm text-body space-y-1 mb-4">
                      <p>Fields: {uni.fields.join(", ")}</p>
                      <p>Levels: {uni.levels.join(", ")}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-[13px] text-body mb-1">
                        Tuition from
                      </p>
                      <p className="font-display text-[28px] text-ink">
                        {formatCurrency(uni.tuitionFrom)}
                      </p>
                      <p className="text-[13px] text-body">a year (sample)</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={{
                      query: { ...searchParams, page: currentPage - 1 },
                    }}
                    className="w-9 h-9 border-[1.5px] border-border rounded-full flex items-center justify-center text-body hover:border-navy"
                  >
                    ←
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <Link
                      key={pageNum}
                      href={{
                        query: { ...searchParams, page: pageNum },
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                        pageNum === currentPage
                          ? "bg-navy text-white"
                          : "border-[1.5px] border-border text-body hover:border-navy"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                )}
                {currentPage < totalPages && (
                  <Link
                    href={{
                      query: { ...searchParams, page: currentPage + 1 },
                    }}
                    className="w-9 h-9 border-[1.5px] border-border rounded-full flex items-center justify-center text-body hover:border-navy"
                  >
                    →
                  </Link>
                )}
              </div>
            )}

            {universities.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-body">
                  No universities found matching your criteria.
                </p>
                <Link href="/universities" className="btn-primary mt-6">
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
