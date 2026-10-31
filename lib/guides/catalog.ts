export type GuideArticle = {
  slug: string;
  title: string;
  category: string;
  description: string;
  readTime: number;
  featured: boolean;
  bullets?: string[];
  content: string;
  createdAt: string;
};

export const GUIDE_CATEGORIES = [
  "All",
  "Getting started",
  "Applying",
  "Visa and arrival",
  "Money",
  "Life in Turkey",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

function article(input: Omit<GuideArticle, "content" | "createdAt" | "featured"> & { featured?: boolean; paragraphs: string[] }): GuideArticle {
  const content = input.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    description: input.description,
    readTime: input.readTime,
    featured: Boolean(input.featured),
    bullets: input.bullets,
    content,
    createdAt: "2026-10-01T00:00:00.000Z",
  };
}

export const fallbackGuides: GuideArticle[] = [
  article({
    slug: "complete-guide-international-students-turkey",
    title: "A complete guide for international students in Turkey",
    category: "Getting started",
    description: "Everything in one place, from choosing a city to your first weeks on campus.",
    readTime: 15,
    featured: true,
    bullets: [
      "Choosing a city and a university",
      "Applying and getting an offer",
      "Costs and scholarships",
      "Visa, residence permit and arrival",
    ],
    paragraphs: [
      "This guide walks through the whole path for a student applying from Pakistan: city, university, application, money, visa and the first weeks after you land.",
      "Start with the city and the language of instruction. Then collect documents, compare tuition with living costs, and only then book the visa appointment.",
      "Each later guide on this page goes deeper on one of those steps. Use this one as the map.",
    ],
  }),
  article({
    slug: "application-guide-documents-to-offer",
    title: "Full application guide: from documents to offer letter",
    category: "Applying",
    description: "Every step of applying, with a checklist you can tick off.",
    readTime: 12,
    paragraphs: [
      "Most private universities take applications online. Public universities often add an exam or a central placement step.",
      "Prepare the passport, transcripts, translations and photos before you open the form. An offer letter is the document the visa file is built on, so check the name spelling against the passport.",
    ],
  }),
  article({
    slug: "turkey-student-visa-guide",
    title: "Turkey student visa: step by step guide",
    category: "Visa and arrival",
    description: "What to prepare, where to apply and how long it usually takes.",
    readTime: 8,
    paragraphs: [
      "The student visa is applied for in Pakistan after you have an acceptance letter. Appointment times and the document list change, so use the consulate’s current list.",
      "Typical files include the acceptance letter, passport, photos, proof of funds and travel insurance. Processing often takes a few weeks, so apply as soon as the letter arrives.",
    ],
  }),
  article({
    slug: "cost-of-studying-in-turkey",
    title: "Cost of studying in Turkey: tuition and living",
    category: "Money",
    description: "A full-year budget for public and private universities, city by city.",
    readTime: 7,
    paragraphs: [
      "Public-university tuition is often much lower than private tuition. Living costs move with the city: Istanbul costs more than Ankara or a smaller city.",
      "A yearly budget should include tuition, housing, food, transport, residence-permit fees and a buffer for the first month.",
    ],
  }),
  article({
    slug: "study-in-turkey-in-english",
    title: "Study in Turkey in English: programs and universities",
    category: "Getting started",
    description: "Which degrees are taught in English and where to find them.",
    readTime: 6,
    paragraphs: [
      "Many programmes are taught fully in English, and some are mixed. The university page, not the agent, is the source for the language of instruction.",
      "If the programme is in Turkish, universities usually offer a language year first. Confirm that year is included before you compare fees.",
    ],
  }),
  article({
    slug: "turkish-degree-recognized-in-pakistan",
    title: "Is a Turkish degree recognized in Pakistan?",
    category: "Getting started",
    description: "How equivalence with HEC works and what to check before you apply.",
    readTime: 6,
    paragraphs: [
      "A degree from a university recognized by YÖK can be submitted for equivalence with the Higher Education Commission in Pakistan. The exact file depends on the level.",
      "Check the university’s recognition and the programme name before you apply, and keep the original transcripts and diploma for the HEC file later.",
    ],
  }),
  article({
    slug: "turkiye-burslari-how-to-apply",
    title: "Türkiye Bursları: how to apply",
    category: "Money",
    description: "Eligibility, the application window and what interviewers look for.",
    readTime: 9,
    paragraphs: [
      "Türkiye Bursları is the Turkish government scholarship. The window is once a year and the published age and marks guides differ by level.",
      "The application asks for study plans and documents. Shortlisted students are interviewed. Results are not guaranteed by meeting the age and marks guide alone.",
    ],
  }),
  article({
    slug: "yos-sat-entrance-exams",
    title: "YÖS, SAT and other entrance exams explained",
    category: "Applying",
    description: "Which exam each type of university asks for, and how to prepare.",
    readTime: 7,
    paragraphs: [
      "Public universities often ask for YÖS or TR-YÖS. Some accept SAT. Private universities may use their own exam or school marks.",
      "Read the current requirement on the university’s admission page. Preparing for the wrong exam is the most common delay.",
    ],
  }),
  article({
    slug: "documents-checklist-pakistani-applicants",
    title: "Documents checklist for Pakistani applicants",
    category: "Applying",
    description: "Transcripts, passport, translations and what to prepare first.",
    readTime: 6,
    paragraphs: [
      "Start with a passport that is valid well past the course start date. Then collect transcripts, a diploma or expected-graduation letter, and photos.",
      "Translations into Turkish or English should follow the university’s rules. Some files also need notarization or an apostille.",
    ],
  }),
  article({
    slug: "public-or-private-university",
    title: "Public or private university: which is right for you?",
    category: "Getting started",
    description: "Cost, class size, scholarships and career links compared.",
    readTime: 5,
    paragraphs: [
      "Public universities usually cost less and can be more competitive to enter. Private universities often have more English programmes and their own merit discounts.",
      "Compare the city, the language, the total yearly cost and whether a merit scholarship is published for your marks.",
    ],
  }),
  article({
    slug: "student-residence-permit",
    title: "Student residence permit after you arrive",
    category: "Visa and arrival",
    description: "The steps and deadlines for your first weeks in Turkey.",
    readTime: 8,
    paragraphs: [
      "The visa lets you enter. The residence permit lets you stay for the study period. Universities usually help with the appointment, but the file is yours.",
      "Book the appointment early. Typical documents are the passport, visa, address registration, acceptance letter, photos and insurance.",
    ],
  }),
  article({
    slug: "first-two-weeks-arrival-checklist",
    title: "Your first two weeks in Turkey: arrival checklist",
    category: "Visa and arrival",
    description: "Airport, SIM card, bank, housing and orientation.",
    readTime: 5,
    paragraphs: [
      "The first days are practical: SIM card, a local number for the university, a bank account if you can open one, and the address you will register.",
      "Go to orientation. That is where residence-permit deadlines and campus cards are explained.",
    ],
  }),
  article({
    slug: "part-time-work-rules",
    title: "Part-time work rules for international students",
    category: "Money",
    description: "What is allowed, what is not, and where to check the current rules.",
    readTime: 4,
    paragraphs: [
      "Work permission for international students is limited and the rule depends on the level of study and how long you have been enrolled.",
      "Do not plan tuition around a job. Check the current rule with the university’s international office before you sign anything.",
    ],
  }),
  article({
    slug: "student-housing-dorms-flats-rentals",
    title: "Student housing: dorms, shared flats and rentals",
    category: "Life in Turkey",
    description: "How to search, what it costs and how to avoid rental scams.",
    readTime: 6,
    paragraphs: [
      "University dorms are the simplest start. Shared flats cost more in Istanbul than in Ankara or Izmir.",
      "Never send a deposit before you have seen the place or confirmed the listing with the university. Scam listings copy real photos.",
    ],
  }),
  article({
    slug: "living-in-istanbul-ankara-izmir",
    title: "Living in Istanbul, Ankara or Izmir compared",
    category: "Life in Turkey",
    description: "Cost, transport, weather and student life in each city.",
    readTime: 6,
    paragraphs: [
      "Istanbul has the most universities and the highest rent. Ankara is the capital, with a large student population and a drier climate. Izmir is coastal and smaller.",
      "Choose the city after the programme, not before. A cheaper city only helps if the programme you want is taught there.",
    ],
  }),
  article({
    slug: "learning-turkish",
    title: "Learning Turkish: do you need it, and how to start",
    category: "Life in Turkey",
    description: "When English is enough, and how language courses work.",
    readTime: 5,
    paragraphs: [
      "An English-taught degree can be finished without fluency in Turkish. Daily life, housing and clinics are easier with some Turkish.",
      "Universities run language courses, including a preparatory year when the programme itself is in Turkish.",
    ],
  }),
];

export type GuideQuery = {
  q?: string;
  category?: string;
  page?: string;
};

export function filterGuides(guides: GuideArticle[], query: GuideQuery) {
  const q = query.q?.trim().toLowerCase() || "";
  const category = query.category && query.category !== "All" ? query.category : "";
  return guides.filter((guide) => {
    if (category && guide.category !== category) return false;
    if (!q) return true;
    const haystack = `${guide.title} ${guide.description} ${guide.category}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function guidesHref(next: { q?: string; category?: string; page?: number }) {
  const params = new URLSearchParams();
  if (next.q?.trim()) params.set("q", next.q.trim());
  if (next.category && next.category !== "All") params.set("category", next.category);
  if (next.page && next.page > 1) params.set("page", String(next.page));
  const value = params.toString();
  return value ? `/guides?${value}` : "/guides";
}
