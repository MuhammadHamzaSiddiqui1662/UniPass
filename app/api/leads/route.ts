import { NextRequest, NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/db";
import { leadSchema } from "@/lib/validations/schemas";
import { sendLeadNotification } from "@/lib/email/mailer";

// Rate limiting storage (in-memory for simplicity)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.count >= 3) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check (add a hidden field in the form)
    if (body._honeypot) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Validate input
    const validatedData = leadSchema.parse(body);

    // Normalize WhatsApp number to E.164 format
    const normalizedNumber = validatedData.whatsappNumber
      .replace(/\s/g, "")
      .replace(/^\+/, "");

    await connectDB();

    // Create lead
    const lead = await Lead.create({
      fullName: validatedData.fullName,
      whatsappNumber: normalizedNumber.startsWith("92")
        ? `+${normalizedNumber}`
        : `+92${normalizedNumber}`,
      city: validatedData.city,
      levelOfStudy: validatedData.levelOfStudy,
      bestTimeToReach: validatedData.bestTimeToReach,
      source: body.source || "consultation-form",
      sourcePage: body.sourcePage || "/",
      referrer: body.referrer,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      university: body.university,
      program: body.program,
      status: "new",
      notes: "",
      activity: [],
      notificationSent: false,
    });

    // Send notification email (non-blocking)
    sendLeadNotification({
      fullName: lead.fullName,
      whatsappNumber: lead.whatsappNumber,
      city: lead.city,
      levelOfStudy: lead.levelOfStudy,
      source: lead.source,
      sourcePage: lead.sourcePage,
    })
      .then(() => {
        Lead.findByIdAndUpdate(lead._id, {
          notificationSent: true,
        }).catch(console.error);
      })
      .catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! We will contact you on WhatsApp within 24 hours.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lead submission error:", error);

    if (error instanceof Error && "errors" in error) {
      return NextResponse.json(
        { error: "Invalid form data. Please check your input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit form. Please try again." },
      { status: 500 }
    );
  }
}
