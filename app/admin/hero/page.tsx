import HeroSlidesManager from "@/components/admin/HeroSlidesManager";
import { connectDB, HeroSlide } from "@/lib/db";
import { serializeHeroSlide, type AdminHeroSlide } from "@/lib/home/hero";

async function getSlides(): Promise<AdminHeroSlide[]> {
  try {
    await connectDB();
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 }).lean();
    return slides.map((slide) => serializeHeroSlide(slide));
  } catch (error) {
    console.error("Failed to fetch hero slides:", error);
    return [];
  }
}

export default async function HeroAdminPage() {
  const slides = await getSlides();
  return <HeroSlidesManager initialSlides={slides} />;
}
