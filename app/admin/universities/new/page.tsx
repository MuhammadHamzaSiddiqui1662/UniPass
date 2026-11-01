"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils/format";
import { TURKISH_CITIES, FIELDS_OF_STUDY, STUDY_LEVELS, UNIVERSITY_TYPES } from "@/lib/utils/constants";
import CountrySelect from "@/components/admin/CountrySelect";

export default function NewUniversityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  const handleNameChange = (value: string) => {
    setName(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      type: formData.get("type"),
      city: formData.get("city"),
      tuitionFrom: parseInt(formData.get("tuitionFrom") as string) || 0,
      tuitionTo: parseInt(formData.get("tuitionTo") as string) || 0,
      description: formData.get("description"),
      foundedYear: parseInt(formData.get("foundedYear") as string) || undefined,
      studentsCount: parseInt(formData.get("studentsCount") as string) || undefined,
      internationalStudents: parseInt(formData.get("internationalStudents") as string) || undefined,
      website: formData.get("website"),
      rankingNational: parseInt(formData.get("rankingNational") as string) || undefined,
      accreditations: formData.get("accreditations") ? (formData.get("accreditations") as string).split(",").map(s => s.trim()) : [],
      fields: Array.from(formData.getAll("fields")),
      levels: Array.from(formData.getAll("levels")),
      languagesOffered: formData.get("languagesOffered") ? (formData.get("languagesOffered") as string).split(",").map(s => s.trim()) : [],
      hasMeritScholarship: formData.get("hasMeritScholarship") === "on",
      country: formData.get("country") || "Türkiye",
      countryCode: String(formData.get("countryCode") || "TR").toUpperCase(),
      scholarshipType: formData.get("scholarshipType") || "none",
      aliases: formData.get("aliases")
        ? String(formData.get("aliases")).split(",").map((item) => item.trim()).filter(Boolean)
        : [],
      featuredOnHome: formData.get("featuredOnHome") === "on",
      homeOrder: parseInt(String(formData.get("homeOrder") || "0"), 10) || 0,
      facilityHighlights: formData.get("facilityHighlights") ? (formData.get("facilityHighlights") as string).split("\n").filter(Boolean) : [],
      facts: formData.get("facts") ? (formData.get("facts") as string).split("\n").filter(Boolean) : [],
      status: formData.get("status"),
      metaTitle: formData.get("metaTitle"),
      metaDescription: formData.get("metaDescription"),
    };

    try {
      const response = await fetch("/api/admin/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create university");
      }

      router.push("/admin/universities");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create university");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/universities" className="text-primary hover:underline">
              ← Back to Universities
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Add University</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  required
                  className="input-field"
                />
                <p className="text-xs text-slate-600 mt-1">URL: /universities/{slug || "slug"}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Type *</label>
                  <select name="type" required className="input-field">
                    <option value="">Select type</option>
                    {UNIVERSITY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">City *</label>
                  <select name="city" required className="input-field">
                    <option value="">Select city</option>
                    {TURKISH_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Brief description of the university"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Tuition From (USD) *</label>
                  <input type="number" name="tuitionFrom" required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tuition To (USD)</label>
                  <input type="number" name="tuitionTo" className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Website</label>
                <input type="url" name="website" className="input-field" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Academic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Fields of Study *</label>
                <div className="grid grid-cols-2 gap-2">
                  {FIELDS_OF_STUDY.map(field => (
                    <label key={field} className="flex items-center gap-2">
                      <input type="checkbox" name="fields" value={field} />
                      <span className="text-sm">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Levels Offered *</label>
                <div className="flex gap-4">
                  {STUDY_LEVELS.map(level => (
                    <label key={level} className="flex items-center gap-2">
                      <input type="checkbox" name="levels" value={level} />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Languages Offered</label>
                <input
                  type="text"
                  name="languagesOffered"
                  className="input-field"
                  placeholder="English, Turkish (comma-separated)"
                />
              </div>

              <CountrySelect />
              <div>
                <label className="block text-sm font-bold mb-1">Scholarship</label>
                <select name="scholarshipType" className="input-field" defaultValue="none">
                  <option value="none">None</option>
                  <option value="partially_funded">Partially funded</option>
                  <option value="fully_funded">Fully funded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Search aliases</label>
                <input name="aliases" className="input-field" placeholder="ITU, Istanbul Teknik" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featuredOnHome" />
                  <span className="text-sm font-bold">Show on home slider</span>
                </label>
                <div>
                  <label className="block text-sm font-bold mb-1">Home order</label>
                  <input type="number" name="homeOrder" className="input-field" defaultValue={0} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="hasMeritScholarship" />
                  <span className="text-sm font-bold">Has Merit Scholarship</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Additional Details</h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Founded Year</label>
                  <input type="number" name="foundedYear" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Students Count</label>
                  <input type="number" name="studentsCount" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">International Students</label>
                  <input type="number" name="internationalStudents" className="input-field" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">National Ranking</label>
                  <input type="number" name="rankingNational" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Accreditations</label>
                  <input
                    type="text"
                    name="accreditations"
                    className="input-field"
                    placeholder="YÖK, ABET (comma-separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Facility Highlights</label>
                <textarea
                  name="facilityHighlights"
                  rows={3}
                  className="input-field"
                  placeholder="One per line"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Key Facts</label>
                <textarea
                  name="facts"
                  rows={3}
                  className="input-field"
                  placeholder="One per line"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">SEO & Publishing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Meta Title</label>
                <input type="text" name="metaTitle" className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Description</label>
                <textarea name="metaDescription" rows={2} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Status *</label>
                <select name="status" required className="input-field">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create University"}
            </button>
            <Link href="/admin/universities" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
