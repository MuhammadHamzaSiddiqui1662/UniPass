import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { SiteContactProvider } from "@/components/public/SiteContactProvider";
import { getPublicContact } from "@/lib/site/public-contact";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#453F78",
};

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getPublicContact();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return {
    title: contact.metaTitle,
    description: contact.metaDescription,
    keywords: [
      "study in turkey",
      "turkish universities",
      "pakistan students",
      "scholarships",
      "study abroad",
      "turkiye burslari",
    ],
    openGraph: {
      type: "website",
      locale: "en_PK",
      url: baseUrl,
      siteName: contact.brandName,
      title: contact.metaTitle,
      description: contact.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: contact.metaTitle,
      description: contact.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getPublicContact();

  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable}`}>
      <body className="font-body antialiased bg-slate-50 text-primary-900">
        <SiteContactProvider value={contact}>{children}</SiteContactProvider>
      </body>
    </html>
  );
}
