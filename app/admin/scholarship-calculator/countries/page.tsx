import ScorecardCountriesClient from "@/components/admin/ScorecardCountriesClient";
import { loadScorecardAdmin } from "@/lib/scholarships/store";

export default async function ScholarshipCountriesPage() {
  const { countries } = await loadScorecardAdmin();
  return <ScorecardCountriesClient initialCountries={countries} />;
}
