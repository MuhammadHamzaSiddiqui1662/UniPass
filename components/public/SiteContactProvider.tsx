"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PUBLIC_CONTACT_FALLBACK, type PublicContact } from "@/lib/site/contact";

const SiteContactContext = createContext<PublicContact>(PUBLIC_CONTACT_FALLBACK);

export function SiteContactProvider({
  value,
  children,
}: {
  value: PublicContact;
  children: ReactNode;
}) {
  return <SiteContactContext.Provider value={value}>{children}</SiteContactContext.Provider>;
}

export function useSiteContact() {
  return useContext(SiteContactContext);
}
