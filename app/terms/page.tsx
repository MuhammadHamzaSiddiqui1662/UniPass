import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | UniPass",
  description: "UniPass terms of service and user agreement.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-slate-50">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-8">Terms of Service</h1>
            
            <div className="prose max-w-3xl space-y-6">
              <p className="text-slate-600 leading-relaxed">
                <em>Last updated: {new Date().toLocaleDateString()}</em>
              </p>

              <h2 className="text-h3 mt-8 mb-4">Service Description</h2>
              <p className="text-slate-600 leading-relaxed">
                UniPass provides advisory and support services to help Pakistani
                students apply to universities in Türkiye. Our services include
                consultation, application guidance, scholarship information, and
                pre-departure support.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Important Disclaimer</h2>
              <p className="text-slate-600 leading-relaxed font-bold">
                Universities make all admission decisions. We help you prepare a
                complete application and never promise a place.
              </p>
              <p className="text-slate-600 leading-relaxed">
                UniPass is an independent advisory service and is not affiliated with
                any Turkish university or the Turkish government. We do not guarantee
                admission, scholarship awards, or visa approval.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Your Responsibilities</h2>
              <p className="text-slate-600 leading-relaxed">
                As a user of our services, you agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Meet all university application deadlines</li>
                <li>Submit authentic documents and credentials</li>
                <li>Follow the advice and guidance provided</li>
                <li>Communicate promptly and professionally</li>
              </ul>

              <h2 className="text-h3 mt-8 mb-4">Fees and Payments</h2>
              <p className="text-slate-600 leading-relaxed">
                Initial consultations are free. Fees for additional services will be
                clearly communicated before any commitment. Payment terms and refund
                policies will be outlined in separate service agreements.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed">
                UniPass is not responsible for:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Admission decisions made by universities</li>
                <li>Scholarship or visa application outcomes</li>
                <li>Changes to university requirements or policies</li>
                <li>Delays in processing by third parties</li>
                <li>Inaccurate information provided by students</li>
              </ul>

              <h2 className="text-h3 mt-8 mb-4">Termination</h2>
              <p className="text-slate-600 leading-relaxed">
                Either party may terminate services with written notice. Fees for
                services already rendered are non-refundable unless otherwise agreed
                in writing.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Changes to Terms</h2>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use
                of our services after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Contact</h2>
              <p className="text-slate-600 leading-relaxed">
                Questions about these terms? Contact us at:
                <br />
                Email: hello@unipass.example.com
                <br />
                WhatsApp: +92-XXX-XXXXXXX
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
