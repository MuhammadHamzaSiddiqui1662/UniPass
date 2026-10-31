import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | UniPass",
  description: "UniPass privacy policy and data protection practices.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-32">
        <section className="py-20 bg-slate-50">
          <div className="container-1200">
            <h1 className="text-h1-detail mb-8">Privacy Policy</h1>
            
            <div className="prose max-w-3xl space-y-6">
              <p className="text-slate-600 leading-relaxed">
                <em>Last updated: {new Date().toLocaleDateString()}</em>
              </p>

              <h2 className="text-h3 mt-8 mb-4">Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed">
                When you submit a consultation request or contact us, we collect:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Your full name</li>
                <li>WhatsApp number</li>
                <li>City in Pakistan</li>
                <li>Level of study interest</li>
                <li>Preferred contact time</li>
                <li>University or program interests (if applicable)</li>
              </ul>

              <h2 className="text-h3 mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed">
                We use the information you provide to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Contact you about your study abroad inquiry</li>
                <li>Provide personalized university and program recommendations</li>
                <li>Send you relevant information about studying in Türkiye</li>
                <li>Improve our services and website</li>
              </ul>

              <h2 className="text-h3 mt-8 mb-4">Information Sharing</h2>
              <p className="text-slate-600 leading-relaxed">
                We do not sell, trade, or rent your personal information to third
                parties. We may share your information with universities in Türkiye
                only with your explicit consent as part of your application process.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Data Security</h2>
              <p className="text-slate-600 leading-relaxed">
                We implement appropriate technical and organizational measures to
                protect your personal information against unauthorized access,
                alteration, disclosure, or destruction.
              </p>

              <h2 className="text-h3 mt-8 mb-4">Your Rights</h2>
              <p className="text-slate-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-h3 mt-8 mb-4">Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                For privacy-related questions or requests, contact us at:
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
