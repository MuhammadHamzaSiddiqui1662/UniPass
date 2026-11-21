"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/scholarship-calculator", label: "Rules" },
  { href: "/admin/scholarship-calculator/lookups", label: "Lookups" },
  { href: "/admin/scholarship-calculator/routes", label: "Routes" },
  { href: "/admin/scholarship-calculator/countries", label: "Countries" },
];

export default function ScorecardSectionNav() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "btn-primary !px-4 !py-2 !text-[15px]" : "btn-outline !px-4 !py-2 !text-[15px]"}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
