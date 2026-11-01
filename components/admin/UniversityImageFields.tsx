"use client";

import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";

export type UniversityImages = {
  logo: UploadedImage[];
  featured: UploadedImage[];
  gallery: UploadedImage[];
};

export function emptyUniversityImages(): UniversityImages {
  return { logo: [], featured: [], gallery: [] };
}

export function universityImagesFromRecord(university: {
  logo?: string;
  logoAlt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  gallery?: string[];
  galleryAlts?: string[];
}): UniversityImages {
  return {
    logo: university.logo ? [{ url: university.logo, alt: university.logoAlt || "" }] : [],
    featured: university.featuredImage
      ? [{ url: university.featuredImage, alt: university.featuredImageAlt || "" }]
      : [],
    gallery: (university.gallery || []).filter(Boolean).map((url, index) => ({
      url,
      alt: university.galleryAlts?.[index] || "",
    })),
  };
}

export function universityImagesPayload(images: UniversityImages) {
  return {
    logo: images.logo[0]?.url || "",
    logoAlt: images.logo[0]?.alt || "",
    featuredImage: images.featured[0]?.url || "",
    featuredImageAlt: images.featured[0]?.alt || "",
    gallery: images.gallery.map((image) => image.url),
    galleryAlts: images.gallery.map((image) => image.alt),
  };
}

export default function UniversityImageFields({
  slug,
  images,
  onChange,
}: {
  slug?: string;
  images: UniversityImages;
  onChange: (images: UniversityImages) => void;
}) {
  return (
    <div className="bg-white rounded-card border border-slate-200 p-6">
      <h2 className="font-display text-xl mb-4">Images</h2>
      <div className="space-y-6">
        <ImageUploader
          label="Logo"
          hint="Shown beside the university name. JPEG, PNG, WebP, or a sanitized SVG."
          kind="logo"
          slug={slug}
          images={images.logo}
          onChange={(logo) => onChange({ ...images, logo })}
        />
        <ImageUploader
          label="Featured campus image"
          hint="Used on university cards, the home slider, and the detail-page hero."
          kind="featured"
          slug={slug}
          images={images.featured}
          onChange={(featured) => onChange({ ...images, featured })}
        />
        <ImageUploader
          label="Gallery"
          hint="Extra campus photos. Drag a card, or use the arrows, to change the order."
          kind="gallery"
          slug={slug}
          multiple
          images={images.gallery}
          onChange={(gallery) => onChange({ ...images, gallery })}
        />
      </div>
    </div>
  );
}
