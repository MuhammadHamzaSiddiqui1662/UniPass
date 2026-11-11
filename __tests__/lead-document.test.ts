import path from "path";
import {
  assertPdf,
  deleteStoredLeadPdf,
  LeadDocumentError,
  pdfContentDisposition,
  presentLead,
  readLeadPdf,
  resolveLocalLeadDocument,
  safePdfFileName,
  storeLeadPdf,
} from "@/lib/leads/document";

const pdf = Buffer.from("%PDF-1.4\n%test\n");

describe("lead PDF checks", () => {
  test("accepts a PDF and rejects anything else", () => {
    expect(() => assertPdf(pdf, "application/pdf")).not.toThrow();
    expect(() => assertPdf(pdf, "application/pdf; charset=binary")).not.toThrow();
    expect(() => assertPdf(Buffer.from("not a pdf"), "application/pdf")).toThrow(LeadDocumentError);
    expect(() => assertPdf(pdf, "image/png")).toThrow(/Only PDF files/);
    expect(() => assertPdf(Buffer.alloc(0), "application/pdf")).toThrow(/Only PDF files/);
  });

  test("keeps a single safe download name", () => {
    expect(safePdfFileName("Client Packet.pdf")).toBe("Client Packet.pdf");
    expect(safePdfFileName("notes")).toBe("notes.pdf");
    expect(safePdfFileName("../../secret.txt")).toBe("secret.txt.pdf");
    expect(pdfContentDisposition('bad"name\r\n.pdf')).toBe('attachment; filename="badname.pdf"');
  });

  test("rejects document paths outside the private folder", () => {
    expect(resolveLocalLeadDocument("../.env")).toBeNull();
    expect(resolveLocalLeadDocument("..\\secrets.pdf")).toBeNull();
    expect(resolveLocalLeadDocument("not-an-id.pdf")).toBeNull();
    const id = "a".repeat(24);
    expect(resolveLocalLeadDocument(`${id}.pdf`)).toBe(
      path.resolve(process.cwd(), "storage", "lead-documents", `${id}.pdf`)
    );
  });

  test("stores one local PDF and does not reveal the storage key", async () => {
    const id = "b".repeat(24);
    const stored = await storeLeadPdf(id, pdf, "local");
    try {
      expect(stored.provider).toBe("local");
      expect(stored.storageKey).toBe(`${id}.pdf`);
      const read = await readLeadPdf(stored);
      expect(read.equals(pdf)).toBe(true);

      const replaced = await storeLeadPdf(id, pdf, "local");
      expect(replaced.storageKey).toBe(stored.storageKey);

      const view = presentLead({
        fullName: "Amina",
        document: {
          fileName: "packet.pdf",
          storageKey: stored.storageKey,
          provider: "local",
          size: pdf.length,
          uploadedAt: "2026-11-11T00:00:00.000Z",
          uploadedBy: { name: "Sara" },
        },
      });
      expect(view.document).toEqual({
        fileName: "packet.pdf",
        size: pdf.length,
        uploadedAt: "2026-11-11T00:00:00.000Z",
        uploadedBy: { name: "Sara" },
      });
      expect(JSON.stringify(view)).not.toContain("storageKey");
      expect(JSON.stringify(view)).not.toContain(stored.storageKey);
    } finally {
      await deleteStoredLeadPdf(stored);
    }
  });

  test("hides a document that has no stored file", () => {
    expect(presentLead({ document: { fileName: "packet.pdf" } }).document).toBeNull();
    expect(presentLead({}).document).toBeNull();
  });
});
