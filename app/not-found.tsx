import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-32 min-h-screen bg-page-bg">
        <div className="container-1200 py-20 text-center">
          <h1 className="text-h1-hero mb-6">404</h1>
          <p className="text-2xl text-body mb-8">Page not found</p>
          <p className="text-lg text-body mb-12 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="btn-primary px-8 py-3">
            Go to Home Page
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
