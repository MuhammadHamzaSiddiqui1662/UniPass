import Asset from "@/components/home/Asset";

/** Navy square and teal diamond, same center, from the landing header mark. */
export default function LogoMark() {
  return (
    <span className="relative block h-8 w-8 shrink-0" aria-hidden>
      <Asset
        src="/home/imgVector29.svg"
        width={22.4}
        height={22.4}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <Asset
        src="/home/imgVector30.svg"
        width={22.4}
        height={22.4}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
      />
    </span>
  );
}
