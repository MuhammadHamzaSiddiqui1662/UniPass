import { crc32 } from "zlib";
import { rm } from "fs/promises";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { sampleCsvText, decodeCsv, detectDelimiter, parseCsv } from "@/lib/universities/import/csv";
import { executeImport } from "@/lib/universities/import/execute";
import { MAX_IMPORT_ROWS } from "@/lib/universities/import/limits";
import { normalizeUniversityName, previewImport, rowStatus, willImport } from "@/lib/universities/import/preview";
import { emptyZip, isUnsafeZipPath, readZip } from "@/lib/universities/import/zip";
import { University } from "@/lib/db";
import { resolveUploadPath } from "@/lib/upload/storage";

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x00,
]);

function zipStore(files: { name: string; data: Buffer }[]) {
  const parts: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const crc = crc32(file.data) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(file.data.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    parts.push(local, name, file.data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(file.data.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + file.data.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, centralBuf, eocd]);
}

describe("university CSV import", () => {
  it("reads a BOM, Turkish text, and an Excel semicolon file", () => {
    const text = decodeCsv(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("name;city;type\nBoğaziçi Üniversitesi;İstanbul;public\n", "utf8")]));
    expect(text.startsWith("name")).toBe(true);
    expect(detectDelimiter(text)).toBe(";");
    const table = parseCsv(text);
    expect(table.rows[0].cells.name).toBe("Boğaziçi Üniversitesi");
    expect(table.rows[0].cells.city).toBe("İstanbul");
  });

  it("parses the sample and flags a duplicate slug, a bad type, and a name match", () => {
    const sample = parseCsv(sampleCsvText().replace(/^\uFEFF/, ""));
    const preview = previewImport(sample, emptyZip(), []);
    expect(preview).toHaveLength(2);
    expect(preview[0].errors).toEqual([]);
    expect(preview[0].images.some((image) => image.state === "missing")).toBe(true);
    expect(preview[1].images.every((image) => image.state === "url")).toBe(true);
    expect(rowStatus(preview[1], true)).toBe("New");

    const messy = parseCsv(
      [
        "name,slug,type,city,tuitionFrom,description,published",
        "First University,same-slug,public,İstanbul,1000,First description,true",
        "Second University,same-slug,academy,Ankara,1500,Second description,true",
        "Bogazici University,fresh-slug,public,İstanbul,1800,Matched by name,true",
      ].join("\n"),
    );
    const rows = previewImport(messy, emptyZip(), [
      { id: "1", name: "Boğaziçi Üniversitesi", slug: "bogazici-university" },
    ]);
    expect(rows[1].errors.some((error) => error.includes("same-slug"))).toBe(true);
    expect(rows[1].errors.some((error) => error.includes("public or private"))).toBe(true);
    expect(rows[2].match?.slug).toBe("bogazici-university");
    expect(rowStatus(rows[2], true)).toBe("Update");
    expect(rowStatus(rows[2], false)).toBe("Warning");
    expect(willImport(rows[2], false)).toBe(false);
    expect(willImport(rows[0], true)).toBe(true);
    expect(normalizeUniversityName("Boğaziçi Üniversitesi")).toBe(normalizeUniversityName("Bogazici University"));
  });

  it("rejects more than 1000 data rows", () => {
    const lines = ["name,type,city,tuitionFrom,description"];
    for (let index = 0; index < MAX_IMPORT_ROWS + 1; index += 1) {
      lines.push(`University ${index},public,İstanbul,1000,Description`);
    }
    expect(() => parseCsv(lines.join("\n"))).toThrow(/1000/);
  });

  it("matches ZIP names without case or folder, and rejects a path escape", async () => {
    expect(isUnsafeZipPath("../secret.png")).toBe(true);
    const zip = await readZip(zipStore([{ name: "photos/ITU-LOGO.PNG", data: png }]));
    expect(zip.has("itu-logo.png")).toBe(true);
    expect(zip.has("photos/itu-logo.png")).toBe(true);
    expect(zip.get("ITU-LOGO.PNG")?.equals(png)).toBe(true);
    await expect(readZip(zipStore([{ name: "../secret.png", data: png }]))).rejects.toThrow(/unsafe/i);
  });
});

describe("university import writes", () => {
  let mongod: MongoMemoryServer;
  const created: string[] = [];

  beforeAll(async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    for (const url of created) {
      const full = resolveUploadPath(url);
      if (full) await rm(full, { force: true });
    }
  });

  it("creates, updates by folded name, and skips an invalid row", async () => {
    await University.create({
      name: "Boğaziçi Üniversitesi",
      slug: "bogazici-university",
      type: "public",
      city: "İstanbul",
      tuitionFrom: 1800,
      description: "Original description",
      status: "published",
    });
    const table = parseCsv(
      [
        "name,slug,type,city,tuitionFrom,description,published,logo",
        "Campus Import University,campus-import-university,public,Ankara,900,A new campus,true,logo.png",
        "Bogazici University,bogazici-university,public,İstanbul,1900,Updated description,true,",
        "Broken,,nope,Ankara,not-a-number,,true,",
      ].join("\n"),
    );
    const zip = await readZip(zipStore([{ name: "logo.png", data: png }]));
    const rows = previewImport(table, zip, [{ id: String((await University.findOne({ slug: "bogazici-university" }))!._id), name: "Boğaziçi Üniversitesi", slug: "bogazici-university" }]);
    const result = await executeImport(rows, table.present, zip, { updateExisting: true, skipErrors: true });
    expect(result.created).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.skipped).toBe(1);
    const createdDoc = await University.findOne({ slug: "campus-import-university" }).lean();
    expect(createdDoc?.logo).toMatch(/^\/uploads\//);
    if (createdDoc?.logo) created.push(createdDoc.logo);
    const updated = await University.findOne({ slug: "bogazici-university" }).lean();
    expect(updated?.description).toBe("Updated description");
    expect(updated?.tuitionFrom).toBe(1900);
  });
});
