import { connectDB, University, Guide, Scholarship } from "@/lib/db";

export default async function sitemap() {
  try {
    await connectDB();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

    // Static routes
    const routes = [
      "",
      "/universities",
      "/guides",
      "/scholarships",
      "/programs",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
    }));

    // Dynamic routes - universities
    const universities = await University.find({ status: "published" })
      .select("slug updatedAt")
      .lean();
    const universityRoutes = universities.map((uni) => ({
      url: `${baseUrl}/universities/${uni.slug}`,
      lastModified: uni.updatedAt.toISOString(),
    }));

    // Dynamic routes - guides
    const guides = await Guide.find({ status: "published" })
      .select("slug updatedAt")
      .lean();
    const guideRoutes = guides.map((guide) => ({
      url: `${baseUrl}/guides/${guide.slug}`,
      lastModified: guide.updatedAt.toISOString(),
    }));

    // Dynamic routes - scholarships
    const scholarships = await Scholarship.find({ status: "published" })
      .select("slug updatedAt")
      .lean();
    const scholarshipRoutes = scholarships.map((scholarship) => ({
      url: `${baseUrl}/scholarships/${scholarship.slug}`,
      lastModified: scholarship.updatedAt.toISOString(),
    }));

    return [...routes, ...universityRoutes, ...guideRoutes, ...scholarshipRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return [];
  }
}
