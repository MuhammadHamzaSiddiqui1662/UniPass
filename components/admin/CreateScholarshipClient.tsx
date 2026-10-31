"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateScholarshipClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [meritTable, setMeritTable] = useState<any[]>([{ score: "", discount: "" }]);
  const [type, setType] = useState("turkiye-burslari");

  useState(() => {
    fetch("/api/admin/universities")
      .then(res => res.json())
      .then(data => setUniversities(data.universities || []))
      .catch(console.error);
  });

  const addMeritRow = () => {
    setMeritTable([...meritTable, { score: "", discount: "" }]);
  };

  const removeMeritRow = (index: number) => {
    setMeritTable(meritTable.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      university: formData.get("university") || null,
      description: formData.get("description"),
      eligibility: formData.get("eligibility"),
      applicationDeadline: formData.get("applicationDeadline"),
      coverageDetails: formData.get("coverageDetails"),
      meritTable: type === "university-merit" ? meritTable.filter(row => row.score && row.discount) : [],
      status: formData.get("status"),
    };

    try {
      const response = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create scholarship");
      }

      router.push("/admin/scholarships");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create scholarship");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/scholarships" className="text-primary hover:underline">← Back to Scholarships</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Create Scholarship</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input type="text" name="name" required className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Type *</label>
                <select
                  name="type"
                  required
                  className="input-field"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="turkiye-burslari">Türkiye Bursları</option>
                  <option value="university-merit">University Merit Scholarship</option>
                </select>
              </div>

              {type === "university-merit" && (
                <div>
                  <label className="block text-sm font-bold mb-1">University</label>
                  <select name="university" className="input-field">
                    <option value="">None (General)</option>
                    {universities.map(uni => (
                      <option key={uni._id} value={uni._id}>{uni.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1">Description *</label>
                <textarea name="description" required rows={4} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Eligibility</label>
                <textarea name="eligibility" rows={3} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Application Deadline</label>
                <input type="text" name="applicationDeadline" className="input-field" placeholder="e.g. February 20, 2027" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Coverage Details</label>
                <textarea name="coverageDetails" rows={3} className="input-field" placeholder="What the scholarship covers..." />
              </div>
            </div>
          </div>

          {type === "university-merit" && (
            <div className="bg-white rounded-card border border-slate-200 p-6">
              <h2 className="font-display text-xl mb-4">Merit Table</h2>
              <p className="text-sm text-slate-600 mb-4">Define score thresholds and corresponding discounts.</p>
              <div className="space-y-3">
                {meritTable.map((row, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Score (e.g. 90+)"
                      value={row.score}
                      onChange={(e) => {
                        const updated = [...meritTable];
                        updated[index].score = e.target.value;
                        setMeritTable(updated);
                      }}
                      className="input-field flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Discount (e.g. 100%)"
                      value={row.discount}
                      onChange={(e) => {
                        const updated = [...meritTable];
                        updated[index].discount = e.target.value;
                        setMeritTable(updated);
                      }}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeMeritRow(index)}
                      className="px-3 py-2 border border-slate-200 rounded-input hover:bg-error-tint text-error"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMeritRow}
                className="mt-3 text-sm text-primary hover:underline"
              >
                + Add Row
              </button>
            </div>
          )}

          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Publishing</h2>
            <div>
              <label className="block text-sm font-bold mb-1">Status *</label>
              <select name="status" required className="input-field">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create Scholarship"}
            </button>
            <Link href="/admin/scholarships" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
