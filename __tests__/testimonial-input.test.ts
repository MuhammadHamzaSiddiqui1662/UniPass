import { initialsFromName, parseTestimonialWrite } from "@/lib/testimonials/input";

describe("testimonial input", () => {
  it("builds initials from the first two names", () => {
    expect(initialsFromName("Ahmed Khan")).toBe("AK");
    expect(initialsFromName("Fatima")).toBe("F");
  });

  it("requires the fields the homepage shows", () => {
    const missing = parseTestimonialWrite({ studentName: "Amina Shah", status: "published" });
    expect(missing.ok).toBe(false);

    const parsed = parseTestimonialWrite({
      studentName: "Amina Shah",
      origin: "Lahore",
      university: "ITU",
      quote: "The checklist made the visa file clear.",
      status: "published",
      verified: true,
      order: 2,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.initials).toBe("AS");
    expect(parsed.data.verified).toBe(true);
    expect(parsed.data.order).toBe(2);
  });
});
