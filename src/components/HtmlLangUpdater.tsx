"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function HtmlLangUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = pathname.startsWith("/fr") ? "fr-CA" : "en-CA";
  }, [pathname]);

  return null;
}
