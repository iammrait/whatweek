import Link from "next/link";
import { type Locale, locales } from "@/lib/i18n";
import { type WeekSystem } from "@/lib/week";

type Props = {
  locale: Locale;
  year?: number;
  province?: string | null;
  system?: WeekSystem;
};

export function LanguageToggle({ locale, year, province, system }: Props) {
  return (
    <div className="langToggle" aria-label="Language selector">
      {locales.map((item) => {
        const params = new URLSearchParams();
        if (year) params.set("year", String(year));
        if (province) params.set("province", province);
        if (system === "iso") params.set("system", "iso");
        const query = params.toString();
        const href = query ? `/${item}?${query}` : `/${item}`;
        const isActive = item === locale;
        return (
          <Link key={item} href={href} prefetch={false} className={isActive ? "langActive" : ""}>
            {item.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
