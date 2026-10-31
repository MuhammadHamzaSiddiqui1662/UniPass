"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load settings");
      });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      siteName: formData.get("siteName"),
      tagline: formData.get("tagline"),
      whatsappNumber: formData.get("whatsappNumber"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      officeHours: formData.get("officeHours"),
      facebookUrl: formData.get("facebookUrl"),
      instagramUrl: formData.get("instagramUrl"),
      twitterUrl: formData.get("twitterUrl"),
      linkedinUrl: formData.get("linkedinUrl"),
      youtubeUrl: formData.get("youtubeUrl"),
      notificationRecipients: formData.get("notificationRecipients")
        ? (formData.get("notificationRecipients") as string).split(",").map(s => s.trim())
        : [],
      defaultMetaTitle: formData.get("defaultMetaTitle"),
      defaultMetaDescription: formData.get("defaultMetaDescription"),
    };

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      alert("Settings saved successfully!");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
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
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-display text-xl text-primary-900">
                UniPass Admin
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/admin" className="text-slate-600 hover:text-primary-900">
                  Dashboard
                </Link>
                <Link href="/admin/leads" className="text-slate-600 hover:text-primary-900">
                  Leads
                </Link>
                <Link href="/admin/universities" className="text-slate-600 hover:text-primary-900">
                  Universities
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-primary font-bold border-b-2 border-primary pb-1"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display mb-6">Site Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Brand</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  className="input-field"
                  defaultValue={settings?.siteName || "UniPass"}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  className="input-field"
                  defaultValue={settings?.tagline || "Your degree in Türkiye starts here"}
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  className="input-field"
                  placeholder="+92 XXX XXXXXXX"
                  defaultValue={settings?.whatsappNumber}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="input-field"
                  defaultValue={settings?.phone}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  defaultValue={settings?.email}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Office Address</label>
                <textarea
                  name="address"
                  rows={2}
                  className="input-field"
                  defaultValue={settings?.address}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Office Hours</label>
                <textarea
                  name="officeHours"
                  rows={3}
                  className="input-field"
                  placeholder="Monday - Friday: 9:00 AM - 6:00 PM (PKT)"
                  defaultValue={settings?.officeHours}
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Social Media</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Facebook URL</label>
                <input
                  type="url"
                  name="facebookUrl"
                  className="input-field"
                  defaultValue={settings?.facebookUrl}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Instagram URL</label>
                <input
                  type="url"
                  name="instagramUrl"
                  className="input-field"
                  defaultValue={settings?.instagramUrl}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Twitter URL</label>
                <input
                  type="url"
                  name="twitterUrl"
                  className="input-field"
                  defaultValue={settings?.twitterUrl}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  className="input-field"
                  defaultValue={settings?.linkedinUrl}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">YouTube URL</label>
                <input
                  type="url"
                  name="youtubeUrl"
                  className="input-field"
                  defaultValue={settings?.youtubeUrl}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Lead Notifications</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Email Recipients (comma-separated)
                </label>
                <input
                  type="text"
                  name="notificationRecipients"
                  className="input-field"
                  placeholder="admin@example.com, sales@example.com"
                  defaultValue={settings?.notificationRecipients?.join(", ")}
                />
                <p className="text-xs text-slate-600 mt-1">
                  These addresses will receive notifications when new leads are submitted
                </p>
              </div>
            </div>
          </div>

          {/* Default SEO */}
          <div className="bg-white rounded-card border border-slate-200 p-6">
            <h2 className="font-display text-xl mb-4">Default SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Default Meta Title</label>
                <input
                  type="text"
                  name="defaultMetaTitle"
                  className="input-field"
                  defaultValue={settings?.defaultMetaTitle}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Default Meta Description</label>
                <textarea
                  name="defaultMetaDescription"
                  rows={2}
                  className="input-field"
                  defaultValue={settings?.defaultMetaDescription}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
