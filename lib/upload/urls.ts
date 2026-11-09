/** An address we are willing to store: a site path, or an http(s) URL. */
export function isStoredImageReference(value: string) {
  if (!value || value.length > 2000 || value.includes("\0")) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    const pathOnly = value.split("?")[0];
    return !pathOnly.split("/").includes("..");
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function cloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return null;
    const marker = "/image/upload/";
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const parts = parsed.pathname.slice(index + marker.length).split("/").filter(Boolean);
    const asset: string[] = [];
    let started = false;
    for (const part of parts) {
      if (!started) {
        if (/^v\d+$/.test(part) || part.includes(",") || /^(?:c|w|h|q|f|g|b|d|e|l|o|r|a|t|x|y|ar|bo|fl|pg|cs|dpr|so|eo|du)_/.test(part)) {
          continue;
        }
        started = true;
      }
      asset.push(part);
    }
    if (!asset.length) return null;
    asset[asset.length - 1] = asset[asset.length - 1].replace(/\.[a-zA-Z0-9]+$/, "");
    return safePublicId(asset.join("/"));
  } catch {
    return null;
  }
}

export function safePublicId(value: string | undefined | null) {
  if (!value) return null;
  if (!value.startsWith("unipass/")) return null;
  if (value.includes("..") || !/^[\w./-]+$/.test(value)) return null;
  return value;
}
