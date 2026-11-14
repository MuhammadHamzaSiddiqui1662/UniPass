import { folderFor } from "@/lib/upload/storage";
import { normalizeKind } from "@/lib/upload/ingest";
import { guideHtmlHasBody, parseGuideWrite, sanitizeGuideHtml } from "@/lib/guides/html";

describe("guide images", () => {
  it("stores guide uploads in their own folder", () => {
    expect(folderFor("guide", "Student Visa!")).toBe("unipass/guides/student-visa");
    expect(normalizeKind("guide")).toBe("guide");
  });
});

describe("guide html", () => {
  it("keeps article formatting and drops scripts", () => {
    const clean = sanitizeGuideHtml(
      `<p style="text-align: center">Hello <strong>there</strong></p><img src="/uploads/campus.jpg" alt="Campus" width="320"><script>alert(1)</script><p onclick="alert(1)">Safe</p>`,
    );
    expect(clean).toContain("text-align:center");
    expect(clean).toContain("<strong>there</strong>");
    expect(clean).toContain('src="/uploads/campus.jpg"');
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onclick");
    expect(guideHtmlHasBody(clean)).toBe(true);
  });

  it("rejects a javascript image and an empty article", () => {
    expect(sanitizeGuideHtml(`<img src="javascript:alert(1)" alt="x">`)).not.toContain("javascript:");
    const empty = parseGuideWrite({
      title: "Visa",
      slug: "visa",
      category: "Applying",
      description: "How to apply",
      content: "<p></p>",
      status: "draft",
    });
    expect(empty.ok).toBe(false);
  });

  it("copies the cover into the social image when none is set", () => {
    const parsed = parseGuideWrite({
      title: "Visa",
      slug: "Student Visa",
      category: "Applying",
      description: "How to apply",
      content: "<p>Bring your passport.</p>",
      coverImage: "/uploads/cover.jpg",
      status: "published",
      featured: true,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.slug).toBe("student-visa");
    expect(parsed.data.coverImage).toBe("/uploads/cover.jpg");
    expect(parsed.data.ogImage).toBe("/uploads/cover.jpg");
    expect(parsed.data.featured).toBe(true);
  });
});
