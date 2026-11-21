import AdminNav from "@/components/admin/AdminNav";
import ScorecardSectionNav from "@/components/admin/ScorecardSectionNav";
import { requireAdminPage } from "@/lib/auth/guards";

export default async function ScholarshipCalculatorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return (
    <>
      <AdminNav role={session.role} name={session.name} current="calculator" />
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-2 font-display text-2xl">Scholarship calculator</h1>
          <p className="mb-6 max-w-3xl text-sm text-slate-600">
            These rules, lookup scores, funding routes, and country mixes drive the public scorecard. Changing them does not require a code change.
          </p>
          <ScorecardSectionNav />
          {children}
        </main>
      </div>
    </>
  );
}
