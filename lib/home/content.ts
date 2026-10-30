export type HomeUniversity = {
  slug: string;
  name: string;
  type: "public" | "private";
  city: string;
  fields: string[];
  levels: string[];
  tuitionFrom: number;
  image: string;
};

export type HomeGuide = {
  slug: string;
  title: string;
  category: string;
  description: string;
  readTime: number;
  art: "document" | "visa" | "money";
};

export type HomeFaq = {
  question: string;
  answer: string;
};

export type HomeTestimonial = {
  quote: string;
  initials: string;
  name: string;
  origin: string;
  university: string;
  sample: boolean;
};

export const UNIVERSITY_TOTAL_FALLBACK = 8;
export const GUIDE_TOTAL_FALLBACK = 15;
export const TESTIMONIAL_TOTAL_FALLBACK = 9;

const PHOTO_A = "/home/imgVector5.png";
const PHOTO_B = "/home/imgVector15.png";
const PHOTO_C = "/home/imgVector21.png";

export const fallbackUniversities: HomeUniversity[] = [
  {
    slug: "istanbul-technical-university",
    name: "Istanbul Technical University",
    type: "public",
    city: "Istanbul",
    fields: ["Engineering", "Architecture", "Sciences"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 1200,
    image: PHOTO_A,
  },
  {
    slug: "middle-east-technical-university",
    name: "Middle East Technical University",
    type: "public",
    city: "Ankara",
    fields: ["Engineering", "Sciences", "Architecture"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 1500,
    image: PHOTO_B,
  },
  {
    slug: "bogazici-university",
    name: "Boğaziçi University",
    type: "public",
    city: "Istanbul",
    fields: ["Engineering", "Sciences", "Business"],
    levels: ["Bachelor's", "Master's", "PhD"],
    tuitionFrom: 1800,
    image: PHOTO_C,
  },
];

export const fallbackGuides: HomeGuide[] = [
  {
    slug: "application-guide-documents-to-offer",
    title: "Full application guide: from documents to offer letter",
    category: "Applying",
    description: "Every step of applying, with a checklist you can tick off.",
    readTime: 12,
    art: "document",
  },
  {
    slug: "turkey-student-visa-guide",
    title: "Turkey student visa: step by step guide",
    category: "Visa and arrival",
    description: "What to prepare, where to apply and how long it usually takes.",
    readTime: 8,
    art: "visa",
  },
  {
    slug: "cost-of-studying-in-turkey",
    title: "Cost of studying in Turkey: tuition and living",
    category: "Money",
    description:
      "A full-year budget for public and private universities, city by city.",
    readTime: 7,
    art: "money",
  },
];

export const fallbackFaqs: HomeFaq[] = [
  {
    question: "Is a Turkish degree recognized in Pakistan?",
    answer:
      "Degrees from Turkish universities recognized by YÖK can go through equivalence with the Higher Education Commission in Pakistan. Requirements vary by program, so check with HEC before you apply.",
  },
  {
    question: "How much does it cost per year?",
    answer:
      "Public universities range from $700-$2,000 per year, while private universities can cost $8,000-$20,000. Living expenses in Turkey are approximately $300-$500 per month depending on the city.",
  },
  {
    question: "Do I need to speak Turkish?",
    answer:
      "Many programs are taught in English, especially at the graduate level. Learning Turkish still helps day to day, and most universities offer a preparatory Turkish year.",
  },
  {
    question: "Which exam do I need: YÖS, SAT or something else?",
    answer:
      "Public universities often ask for YÖS, and some accept SAT. Private universities set their own requirements. We check the list for the programs on your shortlist.",
  },
  {
    question: "Can I work while I study?",
    answer:
      "International students can work part-time once the right permit is in place. Rules change, so we confirm the current process before you rely on a job.",
  },
  {
    question: "What is daily life like for Pakistani students?",
    answer:
      "Major cities have mosques, halal food and a growing Pakistani student community. Most students settle in over the first month, once housing and the residence permit are sorted.",
  },
];

const sampleStories: Array<Pick<HomeTestimonial, "quote" | "origin" | "university">> = [
  {
    quote:
      "The advisor explained the exam options in plain words. I finally knew which universities were worth applying to.",
    origin: "Lahore",
    university: "ITU",
  },
  {
    quote:
      "I was worried about the cost. The budget breakdown showed me a public university in Ankara was realistic.",
    origin: "Karachi",
    university: "METU",
  },
  {
    quote:
      "My parents wanted proof before deciding. The written checklist and honest answers made them comfortable.",
    origin: "Islamabad",
    university: "Hacettepe",
  },
  {
    quote:
      "The document list was shorter than I expected. I stopped guessing and just followed the order.",
    origin: "Faisalabad",
    university: "Ege",
  },
  {
    quote:
      "I did not understand the visa timing. The week-by-week plan made the wait feel manageable.",
    origin: "Multan",
    university: "Boğaziçi",
  },
  {
    quote:
      "Housing was the part I feared. They showed me options near campus before I booked a flight.",
    origin: "Peshawar",
    university: "Hacettepe",
  },
  {
    quote:
      "My marks are average. The shortlist still had public universities I could actually afford.",
    origin: "Rawalpindi",
    university: "ITU",
  },
  {
    quote:
      "The scholarship explanation was specific. I knew which costs were covered and which were not.",
    origin: "Sialkot",
    university: "METU",
  },
  {
    quote:
      "Arrival week had a checklist for the residence permit. I was not figuring it out at the airport.",
    origin: "Quetta",
    university: "Ege",
  },
];

export const fallbackTestimonials: HomeTestimonial[] = sampleStories.map((story) => ({
  ...story,
  initials: "SN",
  name: "Student name",
  sample: true,
}));

export const CAMPUS_PHOTOS = [PHOTO_A, PHOTO_B, PHOTO_C];

export const admissionSteps = [
  {
    num: "1",
    title: "Free consultation",
    lines: ["Share your marks and goals.", "Leave with a shortlist."],
    duration: "Day 1",
  },
  {
    num: "2",
    title: "Check eligibility",
    lines: ["Confirm which exam each", "university accepts."],
    duration: "1 to 2 weeks",
  },
  {
    num: "3",
    title: "Prepare and apply",
    lines: ["Documents reviewed,", "applications submitted."],
    duration: "2 to 6 weeks",
  },
  {
    num: "4",
    title: "Offer and visa",
    lines: ["Accept an offer, then apply", "for the student visa."],
    duration: "4 to 8 weeks",
  },
  {
    num: "5",
    title: "Arrive and settle",
    lines: ["Residence permit, housing", "and orientation."],
    duration: "First month",
  },
] as const;
