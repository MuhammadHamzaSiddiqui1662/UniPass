"use client";

import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main className="pt-32 min-h-screen bg-page-bg">
        <div className="container-1200 py-20 text-center">
          <h1 className="text-h1-hero mb-6">Something went wrong</h1>
          <p className="text-lg text-body mb-12 max-w-2xl mx-auto">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={reset} className="btn-primary px-8 py-3">
              Try Again
            </button>
            <Link href="/" className="btn-outline px-8 py-3">
              Go to Home Page
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
