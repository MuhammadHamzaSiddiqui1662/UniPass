import Asset from "@/components/home/Asset";
import type { HomeGuide } from "@/lib/home/content";

/** White line icons from the guide cards. They sit on the white card, matching the frame. */
export default function GuideArt({ art }: { art: HomeGuide["art"] }) {
  return (
    <div className="relative h-[160px] overflow-hidden" aria-hidden>
      {art === "document" && (
        <>
          <Asset
            src="/home/imgVector60.svg"
            width={107.2}
            height={107.2}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector61.svg"
            width={107.2}
            height={107.2}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/home/imgVector62.svg"
            width={68.4}
            height={68.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector63.svg"
            width={68.4}
            height={68.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/home/imgVector64.svg"
            width={42.4}
            height={54.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector65.svg"
            width={24.4}
            height={2.4}
            className="absolute left-1/2 top-[46%] -translate-x-1/2"
          />
          <Asset
            src="/home/imgVector65.svg"
            width={24.4}
            height={2.4}
            className="absolute left-1/2 top-[54%] -translate-x-1/2"
          />
          <Asset
            src="/home/imgVector66.svg"
            width={16.4}
            height={2.4}
            className="absolute left-1/2 top-[62%] -translate-x-1/2"
          />
        </>
      )}
      {art === "visa" && (
        <>
          <Asset
            src="/home/imgVector70.svg"
            width={107.2}
            height={107.2}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector71.svg"
            width={107.2}
            height={107.2}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/home/imgVector72.svg"
            width={68.4}
            height={68.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector73.svg"
            width={68.4}
            height={68.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/home/imgVector74.svg"
            width={46.4}
            height={54.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector75.svg"
            width={22.4}
            height={22.4}
            className="absolute left-1/2 top-[42%] -translate-x-1/2"
          />
          <Asset
            src="/home/imgVector76.svg"
            width={26.4}
            height={2.4}
            className="absolute left-1/2 top-[62%] -translate-x-1/2"
          />
        </>
      )}
      {art === "money" && (
        <>
          <Asset
            src="/home/imgVector70.svg"
            width={107.2}
            height={107.2}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector71.svg"
            width={107.2}
            height={107.2}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/home/imgVector78.svg"
            width={68.4}
            height={68.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <Asset
            src="/home/imgVector79.svg"
            width={68.4}
            height={68.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          />
          <Asset
            src="/home/imgVector80.svg"
            width={54.4}
            height={54.4}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[32px] leading-none text-white">
            $
          </span>
        </>
      )}
    </div>
  );
}
