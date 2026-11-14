import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ConsultationForm from "@/components/public/ConsultationForm";
import { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { WhatsAppNumberCopy } from "@/components/public/WhatsAppContact";
import { getPublicContact } from "@/lib/site/public-contact";

export const metadata: Metadata = {
  title: "Contact Us | UniPass",
  description: "Get in touch with UniPass. Book a free consultation or reach out with your questions about studying in Türkiye.",
  openGraph: {
    title: "Contact UniPass",
    description: "Book a free consultation or get in touch",
    type: "website",
  },
};

export default async function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123";
  const contact = await getPublicContact();

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
        <section className="py-20 bg-slate-50">
          <div className="container-1200">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h1 className="text-h1-detail mb-6">Get in Touch</h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Have questions about studying in Türkiye? Book a free 20-minute
                  consultation or reach out to us directly.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-primary-900 mb-2">WhatsApp</h3>
                    <WhatsAppNumberCopy />
                  </div>

                  <div>
                    <h3 className="font-bold text-primary-900 mb-2">Email</h3>
                    <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                      {contact.email}
                    </a>
                  </div>

                  <div>
                    <h3 className="font-bold text-primary-900 mb-2">Office</h3>
                    <p className="text-slate-600">{contact.officeAddress}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-primary-900 mb-2">Hours</h3>
                    <p className="text-slate-600">
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
