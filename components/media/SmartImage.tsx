import Image from "next/image";

function isSvg(src: string) {
  return /\.svg($|\?)/i.test(src.split("#")[0]);
}

export default function SmartImage({
  src,
  alt,
  sizes,
  className,
  fill = true,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  if (isSvg(src)) {
    if (fill) {
      return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className || "object-cover"}`} />;
    }
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  }

  const localUpload = src.startsWith("/uploads/");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={localUpload}
        className={className || "object-cover"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 72}
      height={height || 72}
      sizes={sizes}
      unoptimized={localUpload}
      className={className}
    />
  );
}
