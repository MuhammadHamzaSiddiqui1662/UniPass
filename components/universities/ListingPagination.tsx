import Link from "next/link";
import Asset from "@/components/home/Asset";

function hrefFor(query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/universities?${search}` : "/universities";
}

export default function ListingPagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: Record<string, string | undefined>;
}) {
  const pages = Math.max(totalPages, 1);
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).slice(0, 7);

  return (
    <div className="mt-10 text-center">
      <p className="text-[14px] leading-[18px] text-slate-600">
        That is every verified university we currently support. More are added regularly.
      </p>
      <div className="mt-5 flex items-center justify-center gap-10">
        <PagerLink
          href={page > 1 ? hrefFor(query, page - 1) : undefined}
          label="Previous page"
          direction="prev"
        />
        {numbers.map((number) =>
          number === page ? (
            <span key={number} className="relative grid h-9 w-9 place-items-center">
              <Asset
                src="/universities/pagination__imgVector2.svg"
                width={36}
                height={36}
                className="absolute left-0 top-0"
              />
              <span className="relative text-[15px] font-bold text-white">{number}</span>
            </span>
          ) : (
            <Link
              key={number}
              href={hrefFor(query, number)}
              className="grid h-9 w-9 place-items-center rounded-[8px] border-[1.5px] border-slate-200 text-[15px] font-bold text-primary-900"
            >
              {number}
            </Link>
          ),
        )}
        <PagerLink
          href={page < pages ? hrefFor(query, page + 1) : undefined}
          label="Next page"
          direction="next"
        />
      </div>
    </div>
  );
}

function PagerLink({
  href,
  label,
  direction,
}: {
  href?: string;
  label: string;
  direction: "prev" | "next";
}) {
  const icon = (
    <span className="relative grid h-9 w-9 place-items-center">
      <Asset
        src="/universities/pagination__imgVector.svg"
        width={37.5}
        height={37.5}
        className="absolute left-[-1px] top-[-1px]"
      />
      <Asset
        src="/universities/pagination__imgVector1.svg"
        width={12}
        height={7}
        className="relative"
      />
    </span>
  );

  if (!href) {
    return (
      <span aria-label={label} className="opacity-80">
        {icon}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label}>
      {icon}
    </Link>
  );
}
