import yauzl from "yauzl";
import {
  ImportError,
  MAX_ZIP_BYTES,
  MAX_ZIP_COMPRESSION_RATIO,
  MAX_ZIP_ENTRIES,
  MAX_ZIP_ENTRY_BYTES,
  MAX_ZIP_UNCOMPRESSED_BYTES,
} from "@/lib/universities/import/limits";

export type ZipIndex = {
  names: string[];
  has(reference: string): boolean;
  get(reference: string): Buffer | undefined;
};

export async function readZip(buffer: Buffer): Promise<ZipIndex> {
  if (buffer.length > MAX_ZIP_BYTES) {
    throw new ImportError("ZIP is larger than 100 MB.");
  }
  const zip = await openZip(buffer);
  const files = new Map<string, Buffer>();
  const basenames = new Map<string, string[]>();
  let entries = 0;
  let uncompressed = 0;

  await new Promise<void>((resolve, reject) => {
    let failed = false;
    const fail = (error: Error) => {
      if (failed) return;
      failed = true;
      zip.close();
      reject(error);
    };
    zip.on("error", (error: Error) => {
      if (/path|slip|directory/i.test(error?.message || "")) {
        fail(new ImportError("The ZIP contains an unsafe file path."));
        return;
      }
      fail(new ImportError("The image archive could not be read."));
    });
    zip.on("end", () => {
      if (!failed) resolve();
    });
    zip.on("entry", (entry: yauzl.Entry) => {
      if (failed) return;
      const rawName = entry.fileName.replace(/\\/g, "/");
      if (rawName.endsWith("/")) {
        zip.readEntry();
        return;
      }
      entries += 1;
      if (entries > MAX_ZIP_ENTRIES) {
        fail(new ImportError(`A ZIP can contain at most ${MAX_ZIP_ENTRIES} files.`));
        return;
      }
      if (isUnsafeZipPath(rawName)) {
        fail(new ImportError("The ZIP contains an unsafe file path."));
        return;
      }
      if (entry.uncompressedSize > MAX_ZIP_ENTRY_BYTES) {
        fail(new ImportError("A file in the ZIP is larger than 12 MB."));
        return;
      }
      if (
        entry.compressedSize > 0 &&
        entry.uncompressedSize > 1_000_000 &&
        entry.uncompressedSize / entry.compressedSize > MAX_ZIP_COMPRESSION_RATIO
      ) {
        fail(new ImportError("The ZIP expands too far to be safe."));
        return;
      }
      uncompressed += entry.uncompressedSize;
      if (uncompressed > MAX_ZIP_UNCOMPRESSED_BYTES) {
        fail(new ImportError("The uncompressed ZIP is larger than 150 MB."));
        return;
      }
      zip.openReadStream(entry, (error, stream) => {
        if (failed) return;
        if (error || !stream) {
          fail(new ImportError("The image archive could not be read."));
          return;
        }
        const chunks: Buffer[] = [];
        let read = 0;
        stream.on("data", (chunk: Buffer) => {
          read += chunk.length;
          if (read > entry.uncompressedSize + 1024 || read > MAX_ZIP_ENTRY_BYTES) {
            stream.destroy();
            fail(new ImportError("A file in the ZIP expanded past its stated size."));
          } else {
            chunks.push(chunk);
          }
        });
        stream.on("error", () => fail(new ImportError("The image archive could not be read.")));
        stream.on("end", () => {
          if (failed) return;
          const key = normalizeZipKey(rawName);
          files.set(key, Buffer.concat(chunks));
          const base = key.split("/").pop() || key;
          basenames.set(base, [...(basenames.get(base) || []), key]);
          zip.readEntry();
        });
      });
    });
    zip.readEntry();
  });

  return {
    names: [...files.keys()],
    has(reference) {
      return Boolean(lookup(files, basenames, reference));
    },
    get(reference) {
      const key = lookup(files, basenames, reference);
      return key ? files.get(key) : undefined;
    },
  };
}

export function emptyZip(): ZipIndex {
  return { names: [], has: () => false, get: () => undefined };
}

export function isUnsafeZipPath(value: string) {
  const name = value.replace(/\\/g, "/");
  if (name.startsWith("/") || /^[a-zA-Z]:/.test(name)) return true;
  return name.split("/").some((part) => part === ".." || part === "");
}

function normalizeZipKey(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "").toLowerCase();
}

function lookup(files: Map<string, Buffer>, basenames: Map<string, string[]>, reference: string) {
  const key = normalizeZipKey(reference.trim());
  if (!key || isUnsafeZipPath(key)) return undefined;
  if (files.has(key)) return key;
  const base = key.split("/").pop() || key;
  const matches = basenames.get(base) || [];
  if (matches.length === 1) return matches[0];
  const suffix = matches.filter((name) => name.endsWith(`/${key}`));
  return suffix.length === 1 ? suffix[0] : undefined;
}

function openZip(buffer: Buffer) {
  return new Promise<yauzl.ZipFile>((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true, validateEntrySizes: true, decodeStrings: true }, (error, zip) => {
      if (error || !zip) reject(new ImportError("The image archive is not a valid ZIP."));
      else resolve(zip);
    });
  });
}
