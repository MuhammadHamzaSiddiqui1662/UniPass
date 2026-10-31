import { EmailProvider } from "./types";
import { NodemailerProvider } from "./providers/nodemailer";
import { ResendProvider } from "./providers/resend";
import { EtherealProvider } from "./providers/ethereal";

let emailProvider: EmailProvider | null = null;

function getEmailProvider(): EmailProvider {
  if (emailProvider) return emailProvider;

  // Try Resend first if API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      emailProvider = new ResendProvider();
      console.log("✉️ Using Resend email provider");
      return emailProvider;
    } catch (error) {
      console.warn("Failed to initialize Resend, falling back...");
    }
  }

  // Try Nodemailer if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
      emailProvider = new NodemailerProvider();
      console.log("✉️ Using Nodemailer email provider");
      return emailProvider;
    } catch (error) {
      console.warn("Failed to initialize Nodemailer, falling back...");
    }
  }

  // Fallback to Ethereal (dev logging)
  console.warn("⚠️ No email provider configured, using dev logger");
  emailProvider = new EtherealProvider();
  return emailProvider;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const provider = getEmailProvider();
  return provider.send(options);
}

export async function sendLeadNotification(lead: {
  fullName: string;
  whatsappNumber: string;
  city: string;
  levelOfStudy: string;
  source: string;
  sourcePage: string;
  university?: string;
  program?: string;
}): Promise<void> {
  const { connectDB, SiteSettings } = await import("@/lib/db");

  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();

    const recipients =
      settings?.notificationRecipients || ["admin@unipass.example.com"];

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #453F78;">New Lead Submission</h2>
      <p>A new lead has been submitted through the UniPass website.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">Full Name</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${lead.fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">WhatsApp Number</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${lead.whatsappNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">City</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${lead.city}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">Level of Study</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${lead.levelOfStudy}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">Source</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${lead.source} (${lead.sourcePage})</td>
        </tr>
        ${
          lead.university
            ? `<tr>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">University Interest</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${lead.university}</td>
        </tr>`
            : ""
        }
      </table>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:43123"}/admin/leads" 
           style="display: inline-block; background: #453F78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View in Admin Panel
        </a>
      </p>
    </div>
  `;

    await sendEmail({
      to: recipients,
      subject: `New Lead: ${lead.fullName} - ${lead.levelOfStudy}`,
      html,
      text: `New lead from ${lead.fullName} (${lead.whatsappNumber}), interested in ${lead.levelOfStudy} programs.`,
    });
  } catch (error) {
    console.error("Failed to send lead notification:", error);
  }
}
