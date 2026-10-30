import Asset from "@/components/home/Asset";

const overlays = [
  {
    square: "/home/imgVector6.svg",
    diamond: "/home/imgVector7.svg",
    small: "/home/imgVector8.svg",
    smallDiamond: "/home/imgVector9.svg",
  },
  {
    square: "/home/imgVector16.svg",
    diamond: "/home/imgVector17.svg",
    small: "/home/imgVector18.svg",
    smallDiamond: "/home/imgVector19.svg",
  },
  {
    square: "/home/imgVector16.svg",
    diamond: "/home/imgVector17.svg",
    small: "/home/imgVector22.svg",
    smallDiamond: "/home/imgVector23.svg",
  },
] as const;

export default function CampusPhoto({
  src,
  alt,
  index,
}: {
  src: string;
  alt: string;
  index: number;
}) {
  const art = overlays[index % overlays.length];

  return (
    <div className="relative h-[190px] overflow-hidden bg-east-bay/30">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute left-[69%] top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2">
        <Asset
          src={art.diamond}
          width={127}
          height={127}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
        />
        <Asset
          src={art.square}
          width={127}
          height={127}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <Asset
          src={art.smallDiamond}
          width={81}
          height={81}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
        />
        <Asset
          src={art.small}
          width={81}
          height={81}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div className="absolute bottom-3.5 left-3.5">
        <Asset src="/home/imgVector10.svg" width={169.76} height={24} />
        <span className="absolute inset-0 flex items-center justify-center text-[12px] leading-none text-white">
          Campus photo placeholder
        </span>
      </div>
    </div>
  );
}
