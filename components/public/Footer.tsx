import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="container-1200 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-7 h-7">
                <Image
                  src="/assets/logo.jpeg"
                  alt="UniPass"
                  fill
                  className="object-contain invert"
                />
              </div>
              <span className="font-display text-[26px] text-white">
                UniPass
              </span>
            </Link>
            <p className="text-[15px] leading-relaxed">
              Advisors for students applying to universities in Türkiye. UniPass
              is your bridge to Turkish education.
            </p>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="font-display text-white text-base mb-6">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/universities"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Universities
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarships"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Scholarships
                </Link>
              </li>
              <li>
                <Link
                  href="/#admission-steps"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Admission steps
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="font-display text-white text-base mb-6">Help</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/guides"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/#book"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Book free consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-display text-white text-base mb-6">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/PLACEHOLDER"
                  className="text-[15px] hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@unipass.example.com"
                  className="text-[15px] hover:text-white transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <span className="text-[15px]">
                  Office address in Pakistan (PLACEHOLDER)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/15 my-8" />

        {/* Disclaimer */}
        <div className="text-sm text-footer-text/80">
          <p>
            Universities make all admission decisions. We help you prepare a
            complete application and never promise a place.
          </p>
          <div className="mt-4 flex flex-wrap gap-6 text-xs">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/about"
              className="hover:text-white transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
