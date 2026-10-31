"use client";

import { useState, useEffect } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export default function ComparePage() {
  const [compareList, setCompareList] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("compareList");
    if (stored) {
      const ids = JSON.parse(stored);
      fetch(`/api/universities?ids=${ids.join(",")}`)
        .then(res => res.json())
        .then(data => setUniversities(data.universities || []))
        .catch(console.error);
    }
  }, []);

  const removeFromCompare = (id: string) => {
    const stored = localStorage.getItem("compareList");
    if (stored) {
      const ids = JSON.parse(stored).filter((i: string) => i !== id);
      localStorage.setItem("compareList", JSON.stringify(ids));
      setUniversities(universities.filter(u => u._id !== id));
    }
  };

  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-slate-50">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-6">Compare Universities</h1>
            <p className="text-lg text-slate-600 mb-8">
              Side-by-side comparison of up to 3 universities.
            </p>

            {universities.length === 0 ? (
              <div className="bg-white rounded-card border border-slate-200 p-12 text-center">
                <p className="text-slate-600 mb-4">No universities selected for comparison.</p>
                <Link href="/universities" className="btn-primary">
                  Browse Universities
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-card border border-slate-200 overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Feature</th>
                      {universities.map(uni => (
                        <th key={uni._id} className="px-6 py-4 text-left">
                          <div className="font-bold">{uni.name}</div>
                          <button
                            onClick={() => removeFromCompare(uni._id)}
                            className="text-xs text-error hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm">Type</td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4 text-sm">{uni.type}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm">City</td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4 text-sm">{uni.city}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm">Tuition (USD/year)</td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4 text-sm">
                          ${uni.tuitionFrom?.toLocaleString()} {uni.tuitionTo && `- $${uni.tuitionTo.toLocaleString()}`}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm">Fields Offered</td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4 text-sm">{uni.fields?.join(", ")}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm">Levels</td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4 text-sm">{uni.levels?.join(", ")}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm">Merit Scholarship</td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4 text-sm">{uni.hasMeritScholarship ? "Yes" : "No"}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-sm"></td>
                      {universities.map(uni => (
                        <td key={uni._id} className="px-6 py-4">
                          <Link href={`/universities/${uni.slug}`} className="btn-outline text-sm">
                            View Details
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
