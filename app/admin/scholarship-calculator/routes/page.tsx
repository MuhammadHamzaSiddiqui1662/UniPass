import ScorecardRoutesClient from "@/components/admin/ScorecardRoutesClient";
import { loadScorecardAdmin } from "@/lib/scholarships/store";

export default async function ScholarshipRoutesPage() {
  const { routes } = await loadScorecardAdmin();
  return <ScorecardRoutesClient initialRoutes={routes} />;
}
