export const MAX_IMPORT_ROWS = 1000;
export const MAX_CSV_BYTES = 5 * 1024 * 1024;
export const MAX_ZIP_BYTES = 100 * 1024 * 1024;
export const MAX_ZIP_ENTRIES = 500;
export const MAX_ZIP_ENTRY_BYTES = 12 * 1024 * 1024;
export const MAX_ZIP_UNCOMPRESSED_BYTES = 150 * 1024 * 1024;
export const MAX_ZIP_COMPRESSION_RATIO = 100;

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}
