import { Resend } from "resend";
import { EmailProvider } from "../types";

export class ResendProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required");
    }
    this.client = new Resend(apiKey);
  }

  async send(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    try {
      await this.client.emails.send({
        from: process.env.SMTP_FROM || "UniPass <noreply@unipass.example.com>",
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error("Resend send error:", error);
      return false;
    }
  }

  async test(): Promise<boolean> {
    return true; // Resend doesn't have a test endpoint
  }
}
