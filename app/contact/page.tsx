import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ConsultationForm from "@/components/public/ConsultationForm";
import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Contact Us | UniPass",
  description: "Get in touch with UniPass. Book a free consultation or reach out with your questions about studying in Türkiye.",
  openGraph: {
    title: "Contact UniPass",
    description: "Book a free consultation or get in touch",
    type: "website",
  },
};

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Contact", url: `${baseUrl}/contact` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-page-bg">
          <div className="container-1200">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h1 className="text-h1-detail mb-6">Get in Touch</h1>
                <p className="text-lg text-body leading-relaxed mb-8">
                  Have questions about studying in Türkiye? Book a free 20-minute
                  consultation or reach out to us directly.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-ink mb-2">WhatsApp</h3>
                    <a
                      href="https://wa.me/PLACEHOLDER"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-whatsapp-green hover:underline"
                    >
                      +92-XXX-XXXXXXX (PLACEHOLDER)
                    </a>
                  </div>

                  <div>
                    <h3 className="font-bold text-ink mb-2">Email</h3>
                    <a
                      href="mailto:hello@unipass.example.com"
                      className="text-navy hover:underline"
                    >
                      hello@unipass.example.com (PLACEHOLDER)
                    </a>
                  </div>

                  <div>
                    <h3 className="font-bold text-ink mb-2">Office</h3>
                    <p className="text-body">
                      [Office address in Pakistan - PLACEHOLDER]
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-ink mb-2">Hours</h3>
                    <p className="text-body">
                      Monday - Friday: 9:00 AM - 6:00 PM (PKT)
                      <br />
                      Saturday: 10:00 AM - 4:00 PM (PKT)
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <ConsultationForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
