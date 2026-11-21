import ScorecardRulesClient from "@/components/admin/ScorecardRulesClient";
import { loadScorecardAdmin } from "@/lib/scholarships/store";

export default async function ScholarshipCalculatorRulesPage() {
  const { config } = await loadScorecardAdmin();
  return <ScorecardRulesClient initialConfig={config} />;
}
