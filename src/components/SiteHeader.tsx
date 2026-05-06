import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getDictionary, type Locale } from "@/lib/i18n";
import { type ProvinceCode } from "@/lib/provinces";
import { getWeekNumber, type WeekSystem } from "@/lib/week";

type Props = {
  locale: Locale;
  year?: number;
  province?: ProvinceCode | null;
  system?: WeekSystem;
};

export function buildHomeHref(
  locale: Locale,
  {
    year,
    province,
    system,
    absolute = false,
  }: { year?: number; province?: ProvinceCode | null; system?: WeekSystem; absolute?: boolean } = {},
): string {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (province) params.set("province", province);
  if (system === "iso") params.set("system", "iso");
  const query = params.toString();
  const path = `/${locale}${query ? `?${query}` : ""}`;
  return absolute ? `https://whatweek.ca${path}` : path;
}

export function SiteHeader({ locale, year, province, system }: Props) {
  const currentWeek = getWeekNumber(new Date(), system || "canada");
  const dictionary = getDictionary(locale);

  return (
    <header className="header">
      <Link href={buildHomeHref(locale, { province, system })} className="headerBrand">
        <div className="headerLogo" aria-hidden="true">W{currentWeek}</div>
        <div>
          <div className="siteTitle">what<span className="headerDomain">week</span>.ca</div>
          <p>{dictionary.headerTagline}</p>
        </div>
      </Link>
      <div className="headerTools">
        <Link href={`/${locale}/what-week-of-the-year-is-it`} prefetch={false} className="headerBlogLink">
          {locale === "fr" ? "Semaine actuelle" : "Week tools"}
        </Link>
        <Link href={`/${locale}/about`} prefetch={false} className="headerBlogLink">
          {dictionary.aboutNav}
        </Link>
        <a
          href="https://blog.whatweek.ca/"
          className="headerBlogLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.blogNav}
        </a>
        <LanguageToggle locale={locale} year={year} province={province} system={system} />
      </div>
    </header>
  );
}
