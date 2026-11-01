export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "applied", label: "Applied" },
  { value: "enrolled", label: "Enrolled" },
  { value: "lost", label: "Lost" },
] as const;

export const PAKISTANI_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Other",
] as const;

export const CITIES_IN_PAKISTAN = PAKISTANI_CITIES;

export const BEST_TIME_OPTIONS = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 5 PM)",
  "Evening (5 PM - 9 PM)",
] as const;

export const STUDY_LEVELS = [
  "Bachelor's",
  "Master's",
  "PhD",
  "Diploma",
] as const;

export const TURKISH_CITIES = [
  "Istanbul",
  "Ankara",
  "Izmir",
  "Bursa",
  "Antalya",
  "Konya",
  "Adana",
  "Gaziantep",
  "Other",
] as const;

export const CITIES_IN_TURKIYE = TURKISH_CITIES;

export const UNIVERSITY_TYPES = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
] as const;

export const FIELDS_OF_STUDY = [
  "Engineering",
  "Medicine",
  "Computer Science",
  "Business Administration",
  "Architecture",
  "Arts & Design",
  "Natural Sciences",
  "Social Sciences",
  "Law",
  "Education",
  "Other",
] as const;

export const STUDY_FIELDS = FIELDS_OF_STUDY;

export const LANGUAGE_OPTIONS = [
  "English",
  "Turkish",
  "English & Turkish",
] as const;
