import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniPass | Study in Türkiye from Pakistan",
  description:
    "Advisors for Pakistani students applying to universities in Türkiye. Explore programs, scholarships, and get expert guidance from application to arrival.",
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
    url: "https://unipass.example.com",
    siteName: "UniPass",
    title: "UniPass | Study in Türkiye from Pakistan",
    description:
      "Expert guidance for Pakistani students applying to Turkish universities. Free consultation, scholarship info, and full application support.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniPass | Study in Türkiye from Pakistan",
    description:
      "Expert guidance for Pakistani students applying to Turkish universities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable}`}>
      <body className="font-body antialiased bg-page-bg text-ink">
        {children}
      </body>
    </html>
  );
}
