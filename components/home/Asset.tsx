type AssetProps = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
};

/** Renders a design asset at its own pixel size. Do not stretch these. */
export default function Asset({
  src,
  width,
  height,
  alt = "",
  className = "",
}: AssetProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`max-w-none ${className}`}
      style={{ width, height }}
    />
  );
}
