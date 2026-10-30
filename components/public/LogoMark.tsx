type LogoMarkProps = {
  /** Dark word on the white header, light word on the navy footer. */
  tone?: "dark" | "light";
};

/** UniPass flower from /assets/logo.jpeg, at the design lockup size. */
export default function LogoMark({ tone = "dark" }: LogoMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/assets/unipass-mark.png"
        alt=""
        width={32}
        height={30}
        className="h-[30px] w-8"
      />
      <span
        className={`font-display text-[26px] leading-none ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        UniPass
      </span>
    </span>
  );
}
