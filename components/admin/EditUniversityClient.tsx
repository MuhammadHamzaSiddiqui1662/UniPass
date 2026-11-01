"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils/format";
import { TURKISH_CITIES, FIELDS_OF_STUDY, STUDY_LEVELS, UNIVERSITY_TYPES } from "@/lib/utils/constants";

export default function EditUniversityClient({ universityId }: { universityId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/universities/${universityId}`)
      .then(res => res.json())
      .then(data => {
        setUniversity(data.university);
        setName(data.university.name);
        setSlug(data.university.slug);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load university");
        router.push("/admin/universities");
      });
  }, [universityId, router]);

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
      const response = await fetch(`/api/admin/universities/${universityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update university");
      }

      router.push("/admin/universities");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update university");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this university? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/universities/${universityId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      router.push("/admin/universities");
      router.refresh();
    } catch (error) {
      alert("Failed to delete university");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-display mb-6">Edit University</h1>

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
                  <select name="type" required className="input-field" defaultValue={university.type}>
                    <option value="">Select type</option>
                    {UNIVERSITY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">City *</label>
                  <select name="city" required className="input-field" defaultValue={university.city}>
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
                  defaultValue={university.description}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Tuition From (USD) *</label>
                  <input type="number" name="tuitionFrom" required className="input-field" defaultValue={university.tuitionFrom} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Tuition To (USD)</label>
                  <input type="number" name="tuitionTo" className="input-field" defaultValue={university.tuitionTo} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Website</label>
                <input type="url" name="website" className="input-field" defaultValue={university.website} />
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
                      <input
                        type="checkbox"
                        name="fields"
                        value={field}
                        defaultChecked={university.fields?.includes(field)}
                      />
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
                      <input
                        type="checkbox"
                        name="levels"
                        value={level}
                        defaultChecked={university.levels?.includes(level)}
                      />
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
                  defaultValue={university.languagesOffered?.join(", ")}
                  placeholder="English, Turkish (comma-separated)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Country</label>
                  <input name="country" className="input-field" defaultValue={university.country || "Türkiye"} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Country code</label>
                  <input name="countryCode" className="input-field" maxLength={2} defaultValue={university.countryCode || "TR"} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Scholarship</label>
                <select name="scholarshipType" className="input-field" defaultValue={university.scholarshipType || "none"}>
                  <option value="none">None</option>
                  <option value="partially_funded">Partially funded</option>
                  <option value="fully_funded">Fully funded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Search aliases</label>
                <input
                  name="aliases"
                  className="input-field"
                  defaultValue={university.aliases?.join(", ") || ""}
                  placeholder="ITU, Istanbul Teknik"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featuredOnHome" defaultChecked={university.featuredOnHome} />
                  <span className="text-sm font-bold">Show on home slider</span>
                </label>
                <div>
                  <label className="block text-sm font-bold mb-1">Home order</label>
                  <input type="number" name="homeOrder" className="input-field" defaultValue={university.homeOrder || 0} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasMeritScholarship"
                    defaultChecked={university.hasMeritScholarship}
                  />
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
                  <input type="number" name="foundedYear" className="input-field" defaultValue={university.foundedYear} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Students Count</label>
                  <input type="number" name="studentsCount" className="input-field" defaultValue={university.studentsCount} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">International Students</label>
                  <input type="number" name="internationalStudents" className="input-field" defaultValue={university.internationalStudents} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">National Ranking</label>
                  <input type="number" name="rankingNational" className="input-field" defaultValue={university.rankingNational} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Accreditations</label>
                  <input
                    type="text"
                    name="accreditations"
                    className="input-field"
                    defaultValue={university.accreditations?.join(", ")}
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
                  defaultValue={university.facilityHighlights?.join("\n")}
                  placeholder="One per line"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Key Facts</label>
                <textarea
                  name="facts"
                  rows={3}
                  className="input-field"
                  defaultValue={university.facts?.join("\n")}
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
                <input type="text" name="metaTitle" className="input-field" defaultValue={university.metaTitle} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Meta Description</label>
                <textarea name="metaDescription" rows={2} className="input-field" defaultValue={university.metaDescription} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Status *</label>
                <select name="status" required className="input-field" defaultValue={university.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/universities" className="btn-outline">
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto px-4 py-2 bg-error text-white rounded-input hover:bg-error/90 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
