import ScorecardLookupsClient from "@/components/admin/ScorecardLookupsClient";
import { loadScorecardAdmin } from "@/lib/scholarships/store";

export default async function ScholarshipLookupsPage() {
  const { config } = await loadScorecardAdmin();
  return <ScorecardLookupsClient initialConfig={config} />;
}
