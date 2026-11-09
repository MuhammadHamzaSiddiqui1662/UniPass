export const IMPORT_COLUMNS = [
  { key: "name", header: "name", required: true, hint: "University name. Required. Turkish characters are kept." },
  { key: "slug", header: "slug", hint: "Lowercase URL slug. Generated from the name when empty. Re-import matches this first." },
  { key: "type", header: "type", required: true, hint: "public or private." },
  { key: "city", header: "city", required: true, hint: "City name, for example İstanbul." },
  { key: "country", header: "country", hint: "Defaults to Türkiye." },
  { key: "countryCode", header: "countryCode", hint: "Two-letter code. Defaults to TR." },
  { key: "scholarshipType", header: "scholarshipType", hint: "fully_funded, partially_funded, or none." },
  { key: "fields", header: "fields", hint: "Programs or fields, separated by |. Example: Engineering|Architecture" },
  { key: "levels", header: "levels", hint: "Study levels separated by |. Example: Bachelor's|Master's|PhD" },
  { key: "languages", header: "languages", hint: "Languages separated by |. Example: English|Turkish" },
  { key: "tuitionFrom", header: "tuitionFrom", required: true, hint: "Minimum yearly tuition as a number. 1,200 is accepted." },
  { key: "tuitionTo", header: "tuitionTo", hint: "Maximum yearly tuition. Leave blank if you only know the minimum." },
  { key: "tuitionCurrency", header: "tuitionCurrency", hint: "Currency code. Defaults to USD." },
  { key: "description", header: "description", required: true, hint: "Short public description." },
  { key: "whyChoose", header: "whyChoose", hint: "Optional “why students choose it” paragraph." },
  { key: "programsInfo", header: "programsInfo", hint: "Optional programs paragraph." },
  { key: "campusLife", header: "campusLife", hint: "Optional campus-life paragraph." },
  { key: "website", header: "website", hint: "https URL of the university site." },
  { key: "ranking", header: "ranking", hint: "Optional whole number." },
  { key: "facts", header: "facts", hint: "Pairs separated by |. Example: Founded: 1773|Campus: Ayazağa" },
  { key: "aliases", header: "aliases", hint: "Search aliases separated by |. Example: ITU|Istanbul Teknik" },
  { key: "featuredOnHome", header: "featuredOnHome", hint: "true or false. Defaults to false." },
  { key: "homeOrder", header: "homeOrder", hint: "Whole number. Lower numbers appear first on the home slider." },
  { key: "hasMeritScholarship", header: "hasMeritScholarship", hint: "true or false." },
  { key: "published", header: "published", hint: "true publishes the page. false or blank keeps it as a draft." },
  { key: "logo", header: "logo", hint: "ZIP filename (any folder, case-insensitive) or an https URL. SVG is allowed for logos." },
  { key: "featuredImage", header: "featured_image", hint: "Campus photo used on cards and the detail hero. ZIP filename or https URL." },
  { key: "gallery", header: "gallery", hint: "Extra campus photos separated by |. Each is a ZIP filename or https URL." },
  { key: "metaTitle", header: "metaTitle", hint: "Optional SEO title." },
  { key: "metaDescription", header: "metaDescription", hint: "Optional SEO description." },
  { key: "ogImage", header: "ogImage", hint: "Optional share image. ZIP filename, https URL, or a path already hosted by UniPass." },
] as const;

export type ImportKey = (typeof IMPORT_COLUMNS)[number]["key"];

const HEADER_ALIASES: Record<string, ImportKey> = {};
for (const column of IMPORT_COLUMNS) {
  HEADER_ALIASES[normalizeHeader(column.header)] = column.key;
  HEADER_ALIASES[normalizeHeader(column.key)] = column.key;
}
HEADER_ALIASES.programs = "fields";
HEADER_ALIASES.fieldsofstudy = "fields";
HEADER_ALIASES.scholarship = "scholarshipType";
HEADER_ALIASES.tuitionmin = "tuitionFrom";
HEADER_ALIASES.tuitionmax = "tuitionTo";
HEADER_ALIASES.currency = "tuitionCurrency";
HEADER_ALIASES.featuredimage = "featuredImage";
HEADER_ALIASES.status = "published";
HEADER_ALIASES.minitution = "tuitionFrom";
HEADER_ALIASES.maxtuition = "tuitionTo";

export function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function headerKey(value: string): ImportKey | null {
  return HEADER_ALIASES[normalizeHeader(value)] || null;
}

export function sampleCsv() {
  const headers = IMPORT_COLUMNS.map((column) => column.header);
  const itu = blank();
  itu.name = "İstanbul Teknik Üniversitesi";
  itu.slug = "istanbul-technical-university";
  itu.type = "public";
  itu.city = "İstanbul";
  itu.country = "Türkiye";
  itu.countryCode = "TR";
  itu.scholarshipType = "none";
  itu.fields = "Engineering|Architecture|Sciences";
  itu.levels = "Bachelor's|Master's|PhD";
  itu.languages = "Turkish|English";
  itu.tuitionFrom = "1200";
  itu.tuitionTo = "3500";
  itu.tuitionCurrency = "USD";
  itu.description = "A public technical university in İstanbul, strong in engineering and architecture.";
  itu.website = "https://www.itu.edu.tr";
  itu.ranking = "1";
  itu.facts = "Founded: 1773|Campus: Ayazağa";
  itu.aliases = "ITU|Istanbul Teknik";
  itu.featuredOnHome = "false";
  itu.homeOrder = "0";
  itu.hasMeritScholarship = "false";
  itu.published = "true";
  itu.logo = "itu-logo.png";
  itu.featuredImage = "photos/itu-campus.jpg";
  itu.gallery = "photos/itu-quad.jpg|photos/itu-library.jpg";
  itu.metaTitle = "İstanbul Teknik Üniversitesi | UniPass";
  itu.metaDescription = "Explore İstanbul Teknik Üniversitesi with UniPass.";

  const boun = blank();
  boun.name = "Boğaziçi University";
  boun.slug = "bogazici-university";
  boun.type = "public";
  boun.city = "İstanbul";
  boun.country = "Türkiye";
  boun.countryCode = "TR";
  boun.scholarshipType = "partially_funded";
  boun.fields = "Engineering|Sciences|Business";
  boun.levels = "Bachelor's|Master's|PhD";
  boun.languages = "English|Turkish";
  boun.tuitionFrom = "1800";
  boun.tuitionCurrency = "USD";
  boun.description = "A public university on the Bosphorus with teaching in English and Turkish.";
  boun.website = "https://www.boun.edu.tr";
  boun.ranking = "2";
  boun.facts = "Founded: 1863|Campus: Bebek";
  boun.aliases = "BOUN|Boğaziçi";
  boun.featuredOnHome = "true";
  boun.homeOrder = "1";
  boun.hasMeritScholarship = "true";
  boun.published = "true";
  boun.logo = "https://images.example.com/boun-logo.png";
  boun.featuredImage = "https://images.example.com/boun-campus.jpg";
  boun.gallery = "https://images.example.com/boun-south.jpg|https://images.example.com/boun-library.jpg";
  boun.metaTitle = "Boğaziçi University | UniPass";
  boun.metaDescription = "Explore Boğaziçi University with UniPass.";

  return { headers, rows: [itu, boun] };
}

export function templateGuide() {
  const lines = [
    "# UniPass university import",
    "",
    "Upload a UTF-8 CSV. Excel files saved as CSV are fine: a leading BOM is ignored, and the delimiter may be a comma or a semicolon.",
    "Separate several values in one cell with `|`.",
    "",
    "Image cells take either a file name from the optional ZIP (folders are allowed, and matching ignores case) or an https URL. URLs are downloaded and stored again. A path that UniPass already hosts, such as `/uploads/…`, is kept as-is.",
    "",
    "Limits: 1,000 data rows, a CSV up to 5 MB, and a ZIP up to 100 MB. Each image must be 10 MB or smaller. Some hosts, including Vercel, reject request bodies before they reach the app (often around 4.5 MB). Split the ZIP or import images as URLs if the upload is refused.",
    "",
    "Re-importing updates a university when the slug matches, otherwise when the name matches after Turkish letters, case, and the word “university” are folded. It does not create a second copy.",
    "",
    "Only columns present in the header are written. Leave a column out of the file to keep the current value on update.",
    "",
    "## Columns",
    "",
    ...IMPORT_COLUMNS.map((column) => `- \`${column.header}\`${"required" in column && column.required ? " (required)" : ""}: ${column.hint}`),
    "",
    "## Examples",
    "",
    "- ZIP row: `logo` = `itu-logo.png`, `featured_image` = `photos/itu-campus.jpg`, `gallery` = `photos/itu-quad.jpg|photos/itu-library.jpg`.",
    "- URL row: `logo` = `https://images.example.com/boun-logo.png`.",
    "- Scholarship: `fully_funded`, `partially_funded`, or `none`.",
    "- Published: `true` or `false`. Blank means draft.",
  ];
  return lines.join("\n");
}

function blank(): Record<ImportKey, string> {
  return {
    name: "",
    slug: "",
    type: "",
    city: "",
    country: "",
    countryCode: "",
    scholarshipType: "",
    fields: "",
    levels: "",
    languages: "",
    tuitionFrom: "",
    tuitionTo: "",
    tuitionCurrency: "",
    description: "",
    whyChoose: "",
    programsInfo: "",
    campusLife: "",
    website: "",
    ranking: "",
    facts: "",
    aliases: "",
    featuredOnHome: "",
    homeOrder: "",
    hasMeritScholarship: "",
    published: "",
    logo: "",
    featuredImage: "",
    gallery: "",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
  };
}
