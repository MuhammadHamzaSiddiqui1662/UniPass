import { NextRequest, NextResponse } from "next/server";
import { connectDB, SiteSettings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    let settings = await SiteSettings.findOne().lean();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await SiteSettings.create({
        brandName: "UniPass",
        tagline:
          "Advisors for students applying to universities in Türkiye. UniPass is your bridge to Turkish education.",
        notificationRecipients: ["admin@unipass.example.com"],
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    // Update or create settings (there should only be one document)
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Revalidate all pages since settings affect headers/footers everywhere
    revalidatePath("/", "layout");

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
