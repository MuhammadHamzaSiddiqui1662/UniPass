import Link from "next/link";
import Asset from "@/components/home/Asset";
import LogoMark from "@/components/public/LogoMark";
import { CONTACT_EMAIL, OFFICE_ADDRESS, whatsappHref } from "@/lib/site/contact";

const linkClass = "text-[15px] leading-6 text-footer-text transition-colors hover:text-white";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-footer-bg text-footer-text">
      <img
        src="/home/imgVector96.svg"
        alt=""
        width={1440}
        height={340}
        className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2"
        style={{ width: 1440, height: 340 }}
      />
      <div className="container-1200 relative pb-10 pt-16 lg:pb-12 lg:pt-[72px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <Link href="/" className="mb-4 inline-flex">
              <LogoMark tone="light" />
            </Link>
            <p className="max-w-[280px] text-[15px] leading-[23px] text-footer-text">
              Advisors for students applying to universities in Türkiye. UniPass is your
              bridge to Turkish education.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 font-display text-[16px] text-white">Explore</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/universities" className={linkClass}>
                  Universities
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className={linkClass}>
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/#admission-steps" className={linkClass}>
                  Admission steps
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-4 font-display text-[16px] text-white">Help</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/guides" className={linkClass}>
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/#faq" className={linkClass}>
                  Questions
                </Link>
              </li>
              <li>
                <Link href="/#book" className={linkClass}>
                  Book free consultation
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-4 font-display text-[16px] text-white">Contact</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href={whatsappHref()}
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                  Email
                </a>
              </li>
              <li>
                <span className="text-[15px] leading-6">{OFFICE_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden pt-6">
          <Asset
            src="/home/imgVector98.svg"
            width={1200}
            height={1}
            className="absolute left-0 top-0"
          />
          <p className="text-[14px] leading-6 text-footer-text">
            Universities make all admission decisions. We help you prepare a complete
            application and never promise a place.
          </p>
        </div>
      </div>
    </footer>
  );
}
