export function isDesignPhoto(src?: string) {
  if (!src) return true;
  return (
    src.startsWith("/home/") ||
    src.startsWith("/universities/") ||
    src.startsWith("/university-detail/") ||
    src.startsWith("/assets/")
  );
}
