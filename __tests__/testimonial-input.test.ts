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
    expect(parsed.data.image).toBe("");
    expect(parsed.data.imageAlt).toBe("");
  });

  it("keeps an uploaded photo and drops alt text when the photo is removed", () => {
    const withPhoto = parseTestimonialWrite({
      studentName: "Amina Shah",
      origin: "Lahore",
      university: "ITU",
      quote: "The checklist made the visa file clear.",
      status: "draft",
      image: "/uploads/amina.jpg",
      imageAlt: "Amina on campus",
    });
    expect(withPhoto.ok).toBe(true);
    if (!withPhoto.ok) return;
    expect(withPhoto.data.image).toBe("/uploads/amina.jpg");
    expect(withPhoto.data.imageAlt).toBe("Amina on campus");

    const cleared = parseTestimonialWrite({
      studentName: "Amina Shah",
      origin: "Lahore",
      university: "ITU",
      quote: "The checklist made the visa file clear.",
      status: "draft",
      image: "",
      imageAlt: "Amina on campus",
    });
    expect(cleared.ok).toBe(true);
    if (!cleared.ok) return;
    expect(cleared.data.image).toBe("");
    expect(cleared.data.imageAlt).toBe("");

    const remote = parseTestimonialWrite({
      studentName: "Amina Shah",
      origin: "Lahore",
      university: "ITU",
      quote: "The checklist made the visa file clear.",
      status: "published",
      image: "javascript:alert(1)",
    });
    expect(remote.ok).toBe(false);
  });
});
