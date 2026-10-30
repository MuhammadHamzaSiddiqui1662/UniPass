export function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UniPass",
    url: baseUrl,
    logo: `${baseUrl}/assets/logo.jpeg`,
    description:
      "UniPass helps Pakistani students compare universities in Türkiye, understand scholarships, and get support from application to arrival.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: [
      // Add social media URLs from settings
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function UniversitySchema({ university }: { university: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: university.name,
    url: `${baseUrl}/universities/${university.slug}`,
    description: university.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: university.city,
      addressCountry: "TR",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({ article }: { article: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${baseUrl}/guides/${article.slug}`,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: "UniPass",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CourseSchema({ program }: { program: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: program.description,
    provider: {
      "@type": "CollegeOrUniversity",
      name: program.university?.name,
    },
    url: `${baseUrl}/programs/${program.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
