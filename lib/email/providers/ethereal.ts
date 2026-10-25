import { EmailProvider } from "../types";

export class EtherealProvider implements EmailProvider {
  async send(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    console.log("\n📧 [Development Email]");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Body:", options.text || options.html.substring(0, 200) + "...");
    console.log("---\n");
    return true;
  }

  async test(): Promise<boolean> {
    return true;
  }
}
