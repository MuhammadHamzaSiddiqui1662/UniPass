import { cache } from "react";
import { connectDB, SiteSettings } from "@/lib/db";
import { PUBLIC_CONTACT_FALLBACK, visibleContactText, type PublicContact } from "@/lib/site/contact";

/** The contact details edited in Admin → Settings. */
export const getPublicContact = cache(async (): Promise<PublicContact> => {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne()
      .select("whatsappNumber email officeAddress")
      .lean()
      .maxTimeMS(2500);
    return {
      whatsappNumber: settings?.whatsappNumber?.trim() || "",
      email: visibleContactText(settings?.email, PUBLIC_CONTACT_FALLBACK.email),
      officeAddress: visibleContactText(settings?.officeAddress, PUBLIC_CONTACT_FALLBACK.officeAddress),
    };
  } catch (error) {
    console.error("Failed to load public contact settings:", error);
    return PUBLIC_CONTACT_FALLBACK;
  }
});
