"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LogoMark from "@/components/public/LogoMark";
import Asset from "@/components/home/Asset";
import { BRAND_NAME, whatsappHref } from "@/lib/site/contact";

interface HeaderProps {
  activeLink?: string;
}

const navLinks = [
  { href: "/universities", label: "Universities" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/#admission-steps", label: "Admission steps" },
  { href: "/guides", label: "Guides" },
  { href: "/#faq", label: "Questions" },
];

export default function Header({ activeLink }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const wa = whatsappHref();

  const isActive = (href: string) => {
    if (activeLink) return activeLink === href;
    if (href.startsWith("/#")) return false;
    return pathname === href;
  };

  return (
    <header className="fixed inset-x-0 top-5 z-50 px-4 sm:px-6 xl:px-0">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-pill bg-white shadow-header-pill">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-7">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <LogoMark />
              <span className="font-display text-[26px] leading-none text-ink">
                {BRAND_NAME}
              </span>
            </Link>

            <nav className="hidden min-[1180px]:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[16px] transition-colors ${
                    isActive(link.href)
                      ? "font-bold text-navy"
                      : "font-normal text-ink hover:text-navy"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[16px] font-bold text-whatsapp-green hover:opacity-80"
              >
                <Asset src="/home/imgVector31.svg" width={24} height={21} />
                WhatsApp
              </a>
            </nav>

            <Link
              href="/#book"
              className="hidden min-[1180px]:inline-flex h-11 items-center justify-center rounded-pill bg-cta-red px-6 text-[15px] font-bold text-white transition-colors hover:bg-cta-red/90"
            >
              Book free consultation
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center text-ink min-[1180px]:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="flex flex-col gap-1 border-t border-border px-5 py-4 min-[1180px]:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 text-[16px] ${
                    isActive(link.href) ? "font-bold text-navy" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 py-2 text-[16px] font-bold text-whatsapp-green"
              >
                <Asset src="/home/imgVector31.svg" width={24} height={21} />
                WhatsApp
              </a>
              <Link
                href="/#book"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-cta mt-2 h-11 px-6 text-[15px]"
              >
                Book free consultation
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
