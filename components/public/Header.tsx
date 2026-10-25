"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

interface HeaderProps {
  activeLink?: string;
}

export default function Header({ activeLink }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/universities", label: "Universities" },
    { href: "/scholarships", label: "Scholarships" },
    { href: "/#admission-steps", label: "Admission steps" },
    { href: "/guides", label: "Guides" },
    { href: "/#faq", label: "Questions" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-5 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white rounded-pill shadow-header-pill border border-border">
          <div className="px-6 lg:px-9 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-7 h-7">
                <Image
                  src="/assets/logo.jpeg"
                  alt="UniPass"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-display text-[26px] text-ink">
                UniPass
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-body ${
                    activeLink === link.href
                      ? "text-navy font-bold"
                      : "text-ink hover:text-navy"
                  } transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="https://wa.me/PLACEHOLDER"
                className="flex items-center gap-2 text-whatsapp-green font-bold text-base hover:opacity-80"
              >
                <svg
                  width="24"
                  height="21"
                  viewBox="0 0 24 21"
                  fill="none"
                  className="w-6 h-5"
                >
                  <path
                    d="M12 0C5.4 0 0 4.7 0 10.5c0 3.3 1.8 6.2 4.5 8.1l-1.5 4.4 4.8-2.4c1.2.3 2.4.4 3.6.4 6.6 0 12-4.7 12-10.5S18.6 0 12 0z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                WhatsApp
              </Link>
            </nav>

            {/* CTA Button */}
            <Link
              href="/#book"
              className="hidden lg:flex items-center justify-center bg-cta-red text-white font-bold text-[15px] px-6 h-11 rounded-pill hover:bg-cta-red/90 transition-colors"
            >
              Book free consultation
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ink"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border">
              <nav className="flex flex-col px-6 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-body py-2 ${
                      activeLink === link.href
                        ? "text-navy font-bold"
                        : "text-ink"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="https://wa.me/PLACEHOLDER"
                  className="flex items-center gap-2 text-whatsapp-green font-bold text-base py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg
                    width="24"
                    height="21"
                    viewBox="0 0 24 21"
                    fill="none"
                    className="w-6 h-5"
                  >
                    <path
                      d="M12 0C5.4 0 0 4.7 0 10.5c0 3.3 1.8 6.2 4.5 8.1l-1.5 4.4 4.8-2.4c1.2.3 2.4.4 3.6.4 6.6 0 12-4.7 12-10.5S18.6 0 12 0z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  WhatsApp
                </Link>
                <Link
                  href="/#book"
                  className="btn-cta mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book free consultation
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
