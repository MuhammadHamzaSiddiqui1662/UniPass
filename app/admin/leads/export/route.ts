import { NextRequest, NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await connectDB();

    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .populate("university", "name")
      .lean();

    // Generate CSV
    const headers = [
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

    const rows = leads.map((lead: any) => [
      lead._id.toString(),
      lead.fullName,
      lead.whatsappNumber,
      lead.city,
      lead.levelOfStudy,
      lead.bestTimeToReach || "",
      lead.status,
      lead.source,
      lead.sourcePage,
      lead.university?.name || "",
      new Date(lead.createdAt).toISOString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="unipass-leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export leads error:", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}
