import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, Guide } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Abroad Guides | UniPass",
  description: "Expert guides and articles about studying in Türkiye for Pakistani students. Application tips, scholarship advice, and student life.",
};

async function getGuides() {
  try {
    await connectDB();
    const guides = await Guide.find({ status: "published" })
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(guides));
  } catch (error) {
    return [];
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-page-bg">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-6">Study Abroad Guides</h1>
            <p className="text-lg text-body mb-12 max-w-3xl">
              Learn everything you need to know about studying in Türkiye, from
              applications and visas to student life and scholarships.
            </p>

            {guides.length === 0 ? (
              <p className="text-body">No guides available yet. Check back soon!</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide: any) => (
                  <Link
                    key={guide._id}
                    href={`/guides/${guide.slug}`}
                    className="bg-white rounded-card border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <span className="chip-tint text-xs mb-3">
                        {guide.category}
                      </span>
                      {guide.featured && (
                        <span className="chip bg-teal/10 text-teal text-xs ml-2">
                          Featured
                        </span>
                      )}
                      <h3 className="font-display text-xl mt-3 mb-2">
                        {guide.title}
                      </h3>
                      <p className="text-body text-sm mb-4 line-clamp-3">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-body">
                        <span>{guide.readTime} min read</span>
                        <span>•</span>
                        <span>
                          {new Date(guide.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
