import { cache } from "react";
import { connectDB, SiteSettings } from "@/lib/db";
import {
  PUBLIC_CONTACT_FALLBACK,
  publicUrl,
  visibleContactText,
  type PublicContact,
} from "@/lib/site/contact";

/** The contact details edited in Admin → Settings. */
export const getPublicContact = cache(async (): Promise<PublicContact> => {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne()
      .select(
        "brandName tagline whatsappNumber phone email officeAddress officeHours socials defaultMetaTitle defaultMetaDescription"
      )
      .lean()
      .maxTimeMS(2500);
    const socials = settings?.socials;
    return {
      brandName: visibleContactText(settings?.brandName, PUBLIC_CONTACT_FALLBACK.brandName),
      tagline: visibleContactText(settings?.tagline, PUBLIC_CONTACT_FALLBACK.tagline),
      whatsappNumber: settings?.whatsappNumber?.trim() || "",
      phone: visibleContactText(settings?.phone, ""),
      email: visibleContactText(settings?.email, PUBLIC_CONTACT_FALLBACK.email),
      officeAddress: visibleContactText(settings?.officeAddress, PUBLIC_CONTACT_FALLBACK.officeAddress),
      officeHours: settings?.officeHours?.trim() || PUBLIC_CONTACT_FALLBACK.officeHours,
      socials: {
        facebook: publicUrl(socials?.facebook),
        instagram: publicUrl(socials?.instagram),
        twitter: publicUrl(socials?.twitter),
        linkedin: publicUrl(socials?.linkedin),
        youtube: publicUrl(socials?.youtube),
      },
      metaTitle: visibleContactText(settings?.defaultMetaTitle, PUBLIC_CONTACT_FALLBACK.metaTitle),
      metaDescription: visibleContactText(
        settings?.defaultMetaDescription,
        PUBLIC_CONTACT_FALLBACK.metaDescription
      ),
    };
  } catch (error) {
    console.error("Failed to load public contact settings:", error);
    return PUBLIC_CONTACT_FALLBACK;
  }
});
