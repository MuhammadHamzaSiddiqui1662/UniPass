import { readFile, rm } from "fs/promises";
import { inspectImage, ImageValidationError } from "@/lib/upload/detect";
import { ingestImageUrl } from "@/lib/upload/ingest";
import { releaseUnusedImages } from "@/lib/upload/cleanup";
import { getImageStorage, resolveUploadPath } from "@/lib/upload/storage";
import { cloudinaryPublicId } from "@/lib/upload/urls";

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x00,
]);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const webp = Buffer.concat([
  Buffer.from("RIFF", "ascii"),
  Buffer.from([0x0c, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP", "ascii"),
]);
const gif = Buffer.from("GIF89a", "ascii");
const safeSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#453F78"/></svg>`,
  "utf8",
);
const unsafeSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle r="4" onload="alert(1)"/></svg>`,
  "utf8",
);

describe("image bytes", () => {
  it("recognises jpeg, png, and webp from magic bytes", () => {
    expect(inspectImage(jpeg).format).toBe("jpeg");
    expect(inspectImage(png).format).toBe("png");
    expect(inspectImage(webp).format).toBe("webp");
  });

  it("rejects gif even when the caller claims another type", () => {
    expect(() => inspectImage(gif)).toThrow(ImageValidationError);
  });

  it("allows a sanitized svg only for logos", () => {
    expect(() => inspectImage(safeSvg)).toThrow(/logo/i);
    const logo = inspectImage(safeSvg, { allowSvg: true });
    expect(logo.format).toBe("svg");
    expect(logo.buffer.toString("utf8")).toContain("<svg");
  });

  it("strips script and event handlers from an svg logo", () => {
    const logo = inspectImage(unsafeSvg, { allowSvg: true });
    const text = logo.buffer.toString("utf8").toLowerCase();
    expect(text).not.toContain("<script");
    expect(text).not.toContain("onload");
    expect(text).toContain("<svg");
  });
});

describe("local image storage", () => {
  const created: string[] = [];

  afterEach(async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    for (const url of created.splice(0)) {
      const full = resolveUploadPath(url);
      if (full) await rm(full, { force: true });
    }
  });

  it("writes a unique file under public/uploads and deletes it", async () => {
    const storage = getImageStorage();
    expect(storage.name).toBe("local");
    const stored = await storage.upload({
      buffer: jpeg,
      contentType: "image/jpeg",
      extension: "jpg",
      folder: "unipass/universities/test",
    });
    created.push(stored.url);
    expect(stored.url).toMatch(/^\/uploads\/[0-9a-f-]+\.jpg$/);
    const full = resolveUploadPath(stored.url);
    expect(full).toBeTruthy();
    expect((await readFile(full!)).equals(jpeg)).toBe(true);

    await storage.remove({ url: stored.url });
    await expect(readFile(full!)).rejects.toThrow();
  });

  it("does not unlink a path that escapes public/uploads", async () => {
    const storage = getImageStorage();
    await storage.remove({ url: "/uploads/../../package.json" });
    await expect(readFile("package.json")).resolves.toBeTruthy();
    expect(resolveUploadPath("/uploads/../../package.json")).toBeNull();
  });

  it("stores a pasted URL as-is when Cloudinary is not configured", async () => {
    const stored = await ingestImageUrl({
      url: "https://cdn.example.com/campus.jpg",
      kind: "featured",
      slug: "ege-university",
    });
    expect(stored).toEqual({ url: "https://cdn.example.com/campus.jpg", provider: "local" });
  });

  it("rejects a javascript URL", async () => {
    await expect(ingestImageUrl({ url: "javascript:alert(1)", kind: "logo" })).rejects.toThrow(ImageValidationError);
  });

  it("deletes a removed upload and keeps one that is still in use", async () => {
    const storage = getImageStorage();
    const kept = await storage.upload({
      buffer: png,
      contentType: "image/png",
      extension: "png",
      folder: "unipass/universities/test",
    });
    const dropped = await storage.upload({
      buffer: jpeg,
      contentType: "image/jpeg",
      extension: "jpg",
      folder: "unipass/universities/test",
    });
    created.push(kept.url);
    await releaseUnusedImages([kept.url, dropped.url], [kept.url]);
    expect(resolveUploadPath(kept.url)).toBeTruthy();
    await expect(readFile(resolveUploadPath(kept.url)!)).resolves.toBeTruthy();
    await expect(readFile(resolveUploadPath(dropped.url)!)).rejects.toThrow();
  });
});

describe("cloudinary public ids", () => {
  it("reads the public id from a delivery URL", () => {
    expect(
      cloudinaryPublicId(
        "https://res.cloudinary.com/demo/image/upload/c_limit,f_auto,q_auto,w_2000/v1710000000/unipass/universities/itu/campus.jpg",
      ),
    ).toBe("unipass/universities/itu/campus");
    expect(cloudinaryPublicId("https://example.com/unipass/universities/itu/campus.jpg")).toBeNull();
    expect(
      cloudinaryPublicId("https://res.cloudinary.com/demo/image/upload/v1/other/campus.jpg"),
    ).toBeNull();
  });
});
