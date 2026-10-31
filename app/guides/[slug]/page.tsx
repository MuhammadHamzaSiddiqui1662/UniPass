import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { connectDB, Guide } from "@/lib/db";
import { fallbackGuides } from "@/lib/guides/catalog";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

async function getGuide(slug: string) {
  try {
    await connectDB();
    const guide = await Guide.findOne({ slug, status: "published" }).lean();
    if (guide) return JSON.parse(JSON.stringify(guide));
  } catch (error) {
    console.error("Failed to fetch guide:", error);
  }
  return fallbackGuides.find((guide) => guide.slug === slug) ?? null;
}

export async function generateMetadata({
  params: rawParams,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await rawParams;
  const guide = await getGuide(params.slug);

  if (!guide) {
    return {
      title: "Guide Not Found",
    };
  }

  return {
    title: guide.metaTitle || `${guide.title} | UniPass Guides`,
    description: guide.metaDescription || guide.description,
    openGraph: {
      title: guide.metaTitle || guide.title,
      description: guide.metaDescription || guide.description,
      type: "article",
    },
  };
}

export default async function GuideDetailPage({
  params: rawParams,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = await rawParams;
  const guide = await getGuide(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="pt-32">
        <article className="py-12 bg-slate-50">
          <div className="container-1200 max-w-4xl">
            <div className="mb-6">
              <Link
                href="/guides"
                className="text-primary hover:underline text-sm"
              >
                ← Back to guides
              </Link>
            </div>

            <div className="bg-white rounded-card p-8 lg:p-12">
              <div className="mb-8">
                <span className="chip-tint mb-4">{guide.category}</span>
                <h1 className="text-h1-detail mb-4">{guide.title}</h1>
                <p className="text-lg text-slate-600">{guide.description}</p>
                <div className="flex items-center gap-4 mt-6 text-sm text-slate-600">
                  <span>{guide.readTime} min read</span>
                  <span>•</span>
                  <span>
                    {new Date(guide.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: guide.content }}
              />

              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="font-display text-xl mb-4">
                  Ready to start your journey?
                </h3>
                <p className="text-slate-600 mb-6">
                  Book a free consultation to discuss your study abroad plans.
                </p>
                <Link href="/#book" className="btn-primary">
                  Book Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
