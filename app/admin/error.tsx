"use client";

import Link from "next/link";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="font-display text-xl text-primary-900">
            UniPass Admin
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-bold text-primary-900">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          This admin page could not be shown. Your other records are unchanged.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button type="button" onClick={reset} className="btn-primary px-8 py-3">
            Try again
          </button>
          <Link href="/admin/universities" className="btn-outline px-8 py-3">
            Back to universities
          </Link>
        </div>
      </main>
    </div>
  );
}
