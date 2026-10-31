type CountryFlagProps = {
  code?: string;
  name: string;
};

export default function CountryFlag({ code = "TR", name }: CountryFlagProps) {
  const safe = code.toUpperCase().replace(/[^A-Z]/g, "");
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex h-6 items-center rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={name}
        title={name}
      >
        <img
          src={`/flags/${safe}.svg`}
          alt=""
          width={24}
          height={16}
          className="h-4 w-6 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.15)]"
        />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary-900 px-2 py-1 text-[12px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {name}
      </span>
    </span>
  );
}
