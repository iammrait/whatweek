"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type Locale, locales } from "@/lib/i18n";
import { type WeekSystem } from "@/lib/week";

type Props = {
  locale: Locale;
  year?: number;
  province?: string | null;
  system?: WeekSystem;
};

export function LanguageToggle({ locale, year, province, system }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fallbackYear = searchParams.get("year");
  const selectedYear = year ?? (fallbackYear ? Number(fallbackYear) : undefined);
  const selectedProvince = province ?? searchParams.get("province");
  const selectedSystem = system ?? searchParams.get("system");

  return (
    <div className="langToggle" aria-label="Language selector">
      {locales.map((item) => {
        const params = new URLSearchParams();
        if (selectedYear) params.set("year", String(selectedYear));
        if (selectedProvince) params.set("province", selectedProvince);
        if (selectedSystem === "iso") params.set("system", "iso");
        const query = params.toString();
        const href = query ? `/${item}?${query}` : `/${item}`;
        const isActive = item === locale || pathname.startsWith(`/${item}`);
        return (
          <Link key={item} href={href} className={isActive ? "langActive" : ""}>
            {item.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
