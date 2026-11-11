import Link from "next/link";
import { isAdminTier, type UserRole } from "@/lib/auth/permissions";

const BASE_LINKS = [
  { href: "/admin", id: "dashboard", label: "Dashboard" },
  { href: "/admin/leads", id: "leads", label: "Leads" },
];

const ADMIN_LINKS = [
  { href: "/admin/universities", id: "universities", label: "Universities" },
  { href: "/admin/guides", id: "guides", label: "Guides" },
  { href: "/admin/hero", id: "hero", label: "Hero" },
  { href: "/admin/settings", id: "settings", label: "Settings" },
  { href: "/admin/users", id: "users", label: "Users" },
];

export default function AdminNav({
  role,
  name,
  current,
}: {
  role: UserRole;
  name: string;
  current: string;
}) {
  const links = isAdminTier(role) ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS;

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-xl text-primary-900">
              UniPass Admin
            </Link>
            <div className="hidden items-center gap-4 md:flex lg:gap-5">
              {links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={
                    link.id === current
                      ? "text-primary font-bold border-b-2 border-primary pb-1"
                      : "text-slate-600 hover:text-primary-900"
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{name}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-slate-600 hover:text-primary-900">
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
