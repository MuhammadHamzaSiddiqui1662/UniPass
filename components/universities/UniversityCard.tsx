import Link from "next/link";
import Asset from "@/components/home/Asset";
import SmartImage from "@/components/media/SmartImage";
import BookmarkButton from "@/components/universities/BookmarkButton";
import CountryFlag from "@/components/universities/CountryFlag";
import type { CatalogUniversity } from "@/lib/universities/catalog";
import { isDesignPhoto } from "@/lib/universities/photos";
import { formatCurrency } from "@/lib/utils/format";

const PHOTO = "/universities/university-card__imgVector1.png";

export default function UniversityCard({ university }: { university: CatalogUniversity }) {
  const bookmarkId = university._id || university.slug;
  const image = university.featuredImage || PHOTO;
  const placeholder = isDesignPhoto(image);

  return (
    <article className="relative flex min-h-[460px] flex-col overflow-hidden rounded-card border-[1.2px] border-slate-200 bg-white">
      <div className="relative h-[190px] overflow-hidden bg-primary-400/20">
        <SmartImage
          src={image}
          alt={placeholder ? "" : university.featuredImageAlt || `${university.name} campus`}
          sizes="384px"
          className="object-cover"
        />
        {placeholder && <div className="pointer-events-none absolute left-[69%] top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2">
          <Asset
            src="/universities/university-card__imgVector3.svg"
            width={127}
            height={127}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/universities/university-card__imgVector2.svg"
            width={127}
            height={127}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/universities/university-card__imgVector5.svg"
            width={81}
            height={81}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/universities/university-card__imgVector4.svg"
            width={81}
            height={81}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>}
        {placeholder && (
          <div className="absolute bottom-3.5 left-3.5">
            <Asset src="/universities/university-card__imgVector6.svg" width={169.76} height={24} />
            <span className="absolute inset-0 flex items-center justify-center text-[12px] leading-none text-white">
              Campus photo placeholder
            </span>
          </div>
        )}
        {university.hasMeritScholarship && (
          <span className="chip-warning absolute left-[22px] top-5">Merit scholarships</span>
        )}
        <BookmarkButton id={bookmarkId} name={university.name} />
      </div>

      <div className="flex flex-1 flex-col px-[22px] pb-5 pt-[18px]">
        <div className="flex flex-wrap gap-2">
          <span className={university.type === "public" ? "chip-success" : "chip-tint"}>
            {university.type === "public" ? "Public" : "Private"}
          </span>
          <span className="chip-outline">{university.city}</span>
          <CountryFlag code={university.countryCode} name={university.country || "Türkiye"} />
        </div>
        <h2 className="mt-3 font-display text-[20px] leading-6 text-primary-900">
          <Link href={`/universities/${university.slug}`} className="hover:text-primary">
            {university.name}
          </Link>
        </h2>
        <p className="mt-3 text-[14px] leading-5 text-slate-600">Fields: {university.fields.join(", ")}</p>
        <p className="text-[14px] leading-5 text-slate-600">Levels: {university.levels.join(", ")}</p>
        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] text-slate-600">Tuition from</p>
              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-[28px] leading-none text-primary-900">
                  {formatCurrency(university.tuitionFrom)}
                </span>
                <span className="whitespace-nowrap text-[13px] text-slate-600">a year (sample)</span>
              </p>
            </div>
            <Link
              href={`/universities/${university.slug}`}
              className="inline-flex h-11 min-w-[104px] items-center justify-center rounded-input bg-primary px-4 text-[15px] font-bold text-white transition-colors hover:bg-primary-700"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
