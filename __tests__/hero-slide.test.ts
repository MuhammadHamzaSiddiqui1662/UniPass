import { heroSlideSchema } from "@/lib/home/hero";

const image = "/home/imgGroup1.svg";

describe("hero slides", () => {
  it("accepts an image-only slide", () => {
    const slide = heroSlideSchema.parse({ backgroundImage: image });
    expect(slide.title).toBe("");
    expect(slide.description).toBe("");
    expect(slide.buttons).toEqual([]);
    expect(slide.showTrustPoints).toBe(false);
    expect(slide.status).toBe("published");
  });

  it("keeps a line break in the title", () => {
    const slide = heroSlideSchema.parse({
      backgroundImage: image,
      title: "Your degree in Türkiye\nstarts here",
      description: "",
      buttons: [
        { label: "Explore universities", href: "/universities", style: "solid" },
        { label: "Book", href: "/#book" },
      ],
    });
    expect(slide.title).toBe("Your degree in Türkiye\nstarts here");
    expect(slide.buttons[1].style).toBe("solid");
    expect(slide.buttons[0].href).toBe("/universities");
  });

  it("rejects a slide without a background image", () => {
    const result = heroSlideSchema.safeParse({ backgroundImage: "  ", title: "Hello" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toMatch(/background image/i);
  });

  it("rejects unsafe button links and a third button", () => {
    expect(
      heroSlideSchema.safeParse({
        backgroundImage: image,
        buttons: [{ label: "Go", href: "javascript:alert(1)" }],
      }).success,
    ).toBe(false);
    expect(
      heroSlideSchema.safeParse({
        backgroundImage: "https://cdn.example.com/hero.jpg",
        buttons: [
          { label: "One", href: "/universities" },
          { label: "Two", href: "https://example.com/apply" },
          { label: "Three", href: "#book" },
        ],
      }).success,
    ).toBe(false);
  });
});
