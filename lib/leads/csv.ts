interface ExportLead {
  _id: { toString(): string };
  trackingId?: string;
  fullName?: string;
  whatsappNumber?: string;
  city?: string;
  levelOfStudy?: string;
  bestTimeToReach?: string;
  status?: string;
  source?: string;
  sourcePage?: string;
  university?: unknown;
  createdAt?: Date | string;
}

function universityName(university: unknown): string {
  if (university && typeof university === "object" && "name" in university) {
    const name = (university as { name?: unknown }).name;
    return typeof name === "string" ? name : "";
  }
  return "";
}

const HEADERS = [
  "Tracking ID",
  "ID",
  "Full Name",
  "WhatsApp Number",
  "City",
  "Level of Study",
  "Best Time",
  "Status",
  "Source",
  "Source Page",
  "University Interest",
  "Created At",
];

export function leadsToCsv(leads: ExportLead[]): string {
  const rows = leads.map((lead) => [
    lead.trackingId || "",
    lead._id.toString(),
    lead.fullName || "",
    lead.whatsappNumber || "",
    lead.city || "",
    lead.levelOfStudy || "",
    lead.bestTimeToReach || "",
    lead.status || "",
    lead.source || "",
    lead.sourcePage || "",
    universityName(lead.university),
    lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
  ]);

  return [
    HEADERS.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
}
