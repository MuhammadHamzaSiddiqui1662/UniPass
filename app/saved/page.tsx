"use client";

import { useState, useEffect } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("savedUniversities");
    if (stored) {
      const ids = JSON.parse(stored);
      fetch(`/api/universities?ids=${ids.join(",")}`)
        .then(res => res.json())
        .then(data => setSaved(data.universities || []))
        .catch(console.error);
    }
  }, []);

  const removeFromSaved = (id: string) => {
    const stored = localStorage.getItem("savedUniversities");
    if (stored) {
      const ids = JSON.parse(stored).filter((i: string) => i !== id);
      localStorage.setItem("savedUniversities", JSON.stringify(ids));
      setSaved(saved.filter(u => u._id !== id));
    }
  };

  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-page-bg">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-6">Saved Universities</h1>
            <p className="text-lg text-body mb-8">
              Your shortlist of universities to explore.
            </p>

            {saved.length === 0 ? (
              <div className="bg-white rounded-card border border-border p-12 text-center">
                <p className="text-body mb-4">No universities saved yet.</p>
                <Link href="/universities" className="btn-primary">
                  Browse Universities
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saved.map(uni => (
                  <div key={uni._id} className="bg-white rounded-card border border-border overflow-hidden">
                    <div className="p-6">
                      <h3 className="font-display text-xl mb-2">{uni.name}</h3>
                      <p className="text-sm text-body mb-4">{uni.city} · {uni.type}</p>
                      <p className="text-sm text-body line-clamp-3 mb-4">{uni.description}</p>
                      <div className="flex gap-2 mb-4">
                        <Link href={`/universities/${uni.slug}`} className="btn-primary flex-1 text-center text-sm">
                          View Details
                        </Link>
                        <button
                          onClick={() => removeFromSaved(uni._id)}
                          className="px-3 py-2 border border-border rounded-input hover:bg-red-50 text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
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
