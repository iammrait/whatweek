import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogTeaser } from "@/components/BlogTeaser";
import { HolidayPanel } from "@/components/HolidayPanel";
import { SiteHeader, buildHomeHref } from "@/components/SiteHeader";
import { LongWeekendCard } from "@/components/LongWeekendCard";
import { ProvinceSelect } from "@/components/ProvinceSelect";
import { YearCalendar } from "@/components/YearCalendar";
import { getHolidaysForDateRange, getNextLongWeekend } from "@/lib/holidays-ca";
import { getDictionary, isLocale, locales, toLocaleCode, type Locale } from "@/lib/i18n";
import { homeCalendarDescription, homeCalendarTitle } from "@/lib/seo-metadata";
import { defaultCanadaTimeZone, getProvinceTimeZone, isProvinceCode, provinceNames, type ProvinceCode } from "@/lib/provinces";
import {
  formatDateLong,
  getTodayInTimeZone,
  getWeekNumber,
  getWeeksInYear,
  getWeekSystem,
  getYearCalendar,
  startOfWeek,
} from "@/lib/week";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; province?: string; system?: string }>;
};

function resolveProvince(locale: Locale, provinceInput: string | undefined): ProvinceCode | null {
  if (provinceInput && isProvinceCode(provinceInput)) return provinceInput;
  return null;
}

function getYearFromQuery(input: string | undefined, fallback: number): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
    return fallback;
  }
  return Math.trunc(parsed);
}


export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const query = await searchParams;
  const hasSearchParams = Boolean(query.year || query.province || query.system);
  const province = resolveProvince(locale, query.province);
  const provinceName = province ? provinceNames[province][locale] : undefined;
  const system = getWeekSystem(query.system);

  const dictionary = getDictionary(locale);
  const geoSegment = provinceName ?? "Canada";
  const todayMeta = getTodayInTimeZone(defaultCanadaTimeZone);
  const calendarYear = getYearFromQuery(query.year, todayMeta.getUTCFullYear());
  const title = homeCalendarTitle(locale, calendarYear, geoSegment, system);
  const description = homeCalendarDescription(locale, calendarYear, geoSegment, system);
  const canonical = `https://whatweek.ca/${locale}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    keywords:
      locale === "fr"
        ? [
            "numéro de semaine",
            "quel numéro de semaine",
            "semaine actuelle canada",
            "calendrier semaine canada",
            "semaine ISO canada",
            "jours fériés canada",
            "long week-end canada",
            "quelle semaine sommes-nous",
          ]
        : [
            "what week is it",
            "current week number",
            "what week is it today",
            "week number today",
            "canada week calendar",
            "ISO week number canada",
            "canadian holidays",
            "long weekend canada",
            "week number calendar",
          ],
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      siteName: dictionary.brand,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
      languages: {
        "en-CA": "https://whatweek.ca/en",
        "fr-CA": "https://whatweek.ca/fr",
        "x-default": "https://whatweek.ca/en",
      },
    },
    robots: {
      index: !hasSearchParams,
      follow: true,
      googleBot: {
        index: !hasSearchParams,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params, searchParams }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);

  const now = new Date();
  const query = await searchParams;
  const province = resolveProvince(locale, query.province);
  const system = getWeekSystem(query.system);
  const timeZone = getProvinceTimeZone(province);
  const today = getTodayInTimeZone(timeZone, now);
  const defaultYear = today.getUTCFullYear();
  const year = getYearFromQuery(query.year, defaultYear);

  const currentWeek = getWeekNumber(today, system);
  const localeCode = toLocaleCode(locale);
  const weeksInYear = getWeeksInYear(year, system);
  const firstDay = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const lastDay = new Date(Date.UTC(year, 11, 31, 12, 0, 0));
  const yearCalendar = getYearCalendar(year, today, system);
  const weekStart = startOfWeek(today, system);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const [holidays, nextLongWeekend] = await Promise.all([
    getHolidaysForDateRange(weekStart, weekEnd, province),
    getNextLongWeekend(year, today, province),
  ]);

  const provinceName = province ? provinceNames[province][locale] : undefined;
  const canonical = buildHomeHref(locale, { year, province, system, absolute: true });
  const webpageTitle =
    locale === "fr"
      ? `Numéro de semaine actuel au Canada - ${provinceName ?? "Canada"} (${system === "iso" ? "ISO" : "Canada"})`
      : `Current Week Number in Canada - ${provinceName ?? "Canada"} (${system === "iso" ? "ISO" : "Canada"})`;
  const webpageDescription =
    locale === "fr"
      ? `Consultez le numéro de semaine actuel, les semaines ${system === "iso" ? "ISO" : "Canada"}, les jours fériés et les longs week-ends pour ${provinceName ?? "Canada"}.`
      : `Check the current week number, ${system === "iso" ? "ISO" : "Canada"} week calendar, holidays, and long weekends for ${provinceName ?? "Canada"}.`;
  const orgId = "https://whatweek.ca/#organization";
  const websiteId = "https://whatweek.ca/#website";
  const webpageId = `${canonical}#webpage`;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    isPartOf: { "@id": webpageId },
    mainEntity: [
      {
        "@type": "Question",
        name: locale === "fr" ? "Quel est le numéro de semaine actuel au Canada ?" : "What is the current week number in Canada?",
        acceptedAnswer: {
          "@type": "Answer",
          text: locale === "fr" ? `Le numéro de semaine actuel est ${currentWeek}.` : `The current week number is ${currentWeek}.`,
        },
      },
      {
        "@type": "Question",
        name: locale === "fr" ? "Le Canada utilise-t-il ISO 8601 ou dimanche-samedi ?" : "Does Canada use ISO 8601 or Sunday-Saturday weeks?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? "Les deux sont utilisés selon le contexte. Le gouvernement et les entreprises utilisent souvent dimanche-samedi, tandis que ISO 8601 (lundi-dimanche) est la norme internationale. WhatWeek.ca prend en charge les deux systèmes."
              : "Both are used depending on context. Government and business often use Sunday-Saturday, while ISO 8601 (Monday-Sunday) is the international standard. WhatWeek.ca supports both systems.",
        },
      },
      {
        "@type": "Question",
        name: locale === "fr" ? "Quand commence la semaine au Canada ?" : "When does the week start in Canada?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? "Au Canada, les semaines commencent traditionnellement le dimanche. Le système ISO 8601, utilisé internationalement, commence les semaines le lundi."
              : "In Canada, weeks traditionally start on Sunday. The ISO 8601 standard, used internationally, starts weeks on Monday.",
        },
      },
      {
        "@type": "Question",
        name: locale === "fr" ? `Combien de semaines en ${year} ?` : `How many weeks in ${year}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? `L'année ${year} compte ${weeksInYear} semaines ISO.`
              : `The year ${year} has ${weeksInYear} ISO weeks.`,
        },
      },
      {
        "@type": "Question",
        name: locale === "fr" ? "Le numéro de semaine change-t-il selon la province ?" : "Does the week number change by province?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? "Non, le numéro de semaine est le même dans tout le Canada. Cependant, les jours fériés et les longs week-ends varient selon la province."
              : "No, the week number is the same across Canada. However, holidays and long weekends vary by province.",
        },
      },
    ],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: "whatweek.ca",
    url: "https://whatweek.ca",
    logo: "https://whatweek.ca/icon.png",
    sameAs: ["https://blog.whatweek.ca/"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: dictionary.brand,
    url: "https://whatweek.ca",
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    publisher: { "@id": orgId },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://whatweek.ca/en/what-week-of-the-year-is-it",
      },
      "query-input": "required name=search_term",
    },
  };

  const dateModified = new Date().toISOString().slice(0, 10);
  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webpageId,
    url: canonical,
    name: webpageTitle,
    description: webpageDescription,
    dateModified,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
    citation: ["https://date.nager.at/swagger/index.html"],
    isBasedOn: ["https://date.nager.at/swagger/index.html", "https://www.iso.org/iso-8601-date-and-time-format.html"],
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageJsonLd) }} />
      <SiteHeader locale={locale} year={year} province={province} system={system} />

      <section className="hero">
        <h1 className="currentWeek" style={{ fontSize: "inherit", fontWeight: 700, margin: 0 }}>
          {dictionary.currentWeek}: <strong>{dictionary.weekAbbrev} {currentWeek}</strong>
        </h1>
        <p className="subtle">
          {locale === "fr"
            ? `Système de semaine : ${system === "canada" ? "Canada (dimanche à samedi)" : "ISO 8601 (lundi à dimanche)"}`
            : `Week system: ${system === "canada" ? "Canada (Sunday to Saturday)" : "ISO 8601 (Monday to Sunday)"}`}
        </p>
        <p className="subtle">
          {formatDateLong(weekStart, localeCode, timeZone)} - {formatDateLong(weekEnd, localeCode, timeZone)}
        </p>
        <p className="subtle" style={{ maxWidth: "800px", margin: "0.75rem auto 0", lineHeight: 1.6 }}>
          {locale === "fr"
            ? `Calendrier ${year} pour ${provinceName ?? "le Canada"} : numéros de semaine ${system === "iso" ? "ISO 8601" : "Canada (dimanche à samedi)"}, repères pour la paie, l’école et les congés.`
            : `${year} calendar for ${provinceName ?? "Canada"}: ${system === "iso" ? "ISO 8601" : "Canada (Sunday–Saturday)"} week numbers—handy for payroll, school, and planning time off.`}
        </p>

        <div className="systemLinks">
          <Link
            href={buildHomeHref(locale, { year, province, system: "iso" })}
            prefetch={false}
            className={system === "iso" ? "systemActive" : undefined}
            aria-current={system === "iso" ? "page" : undefined}
          >
            ISO 8601
          </Link>
          <Link
            href={buildHomeHref(locale, { year, province, system: "canada" })}
            prefetch={false}
            className={system === "canada" ? "systemActive" : undefined}
            aria-current={system === "canada" ? "page" : undefined}
          >
            Canada
          </Link>
        </div>

        <ProvinceSelect
          provinceLabel={dictionary.provinceLabel}
          allCanadaLabel={dictionary.allCanadaLabel}
          applyLabel={dictionary.applyLabel}
          locale={locale}
          year={year}
          selectedProvince={province}
          system={system}
        />

        <nav className="yearNav" aria-label={dictionary.yearLabel}>
          <Link
            href={buildHomeHref(locale, { year: year - 1, province, system })}
            prefetch={false}
            aria-label={dictionary.prevYear}
          >
            {year - 1}
          </Link>
          <span>{year}</span>
          <Link
            href={buildHomeHref(locale, { year: year + 1, province, system })}
            prefetch={false}
            aria-label={dictionary.nextYear}
          >
            {year + 1}
          </Link>
        </nav>
      </section>

      <section className="cardsSection" aria-labelledby="this-week-heading">
        <h2 id="this-week-heading" className="cardsSectionTitle">
          {dictionary.thisWeekSectionHeading}
        </h2>
        <div className="cards">
          <HolidayPanel locale={locale} dictionary={dictionary} holidays={holidays} />
          <LongWeekendCard locale={locale} dictionary={dictionary} longWeekend={nextLongWeekend} />
        </div>
      </section>

      <YearCalendar locale={locale} dictionary={dictionary} months={yearCalendar} year={year} system={system} today={today} />

      <section className="panel quickLinks">
        <h2>{locale === "fr" ? "Navigation rapide" : "Quick navigation"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {locale === "fr" ? `Calendrier ${year}` : `${year} Calendar`}
          </Link>
          <Link href={`/${locale}/calendar/${year + 1}`} prefetch={false}>
            {locale === "fr" ? `Calendrier ${year + 1}` : `${year + 1} Calendar`}
          </Link>
          <Link href={`/${locale}/current-week-number-canada`} prefetch={false}>
            {locale === "fr" ? "Semaine actuelle" : "Current Week"}
          </Link>
          <Link href={`/${locale}/iso-week-number-canada`} prefetch={false}>
            {locale === "fr" ? "Semaines ISO" : "ISO Weeks"}
          </Link>
          <Link href={`/${locale}/what-week-of-the-year-is-it`} prefetch={false}>
            {locale === "fr" ? "Quelle semaine de l'année?" : "What week of the year is it?"}
          </Link>
          <Link href={`/${locale}/what-day-of-the-year-is-it`} prefetch={false}>
            {locale === "fr" ? "Quel jour de l'année?" : "What day of the year is it?"}
          </Link>
        </div>
      </section>

      <BlogTeaser locale={locale} />

      <footer className="footer">
        <p>
          {dictionary.yearFacts(weeksInYear, formatDateLong(firstDay, localeCode, timeZone), formatDateLong(lastDay, localeCode, timeZone))}
        </p>
        <p className="subtle">
          {locale === "fr" ? "Sources de données : " : "Data sources: "}
          <a href="https://date.nager.at/swagger/index.html" rel="nofollow noreferrer" target="_blank">
            Nager.Date API
          </a>
          {" · "}
          <a href="https://www.iso.org/iso-8601-date-and-time-format.html" rel="nofollow noreferrer" target="_blank">
            ISO 8601
          </a>
        </p>
        <p className="subtle">
          <Link href={`/${locale}/about`} prefetch={false}>
            {dictionary.linkAbout}
          </Link>
          {" · "}
          <Link href={`/${locale}/privacy`} prefetch={false}>
            {dictionary.linkPrivacy}
          </Link>
          {" · "}
          <a href="https://blog.whatweek.ca/" target="_blank" rel="noopener noreferrer">
            {dictionary.blogFooterGuides}
          </a>
          {" · "}
          <a href="/llms.txt">{dictionary.llmsTxtLink}</a>
        </p>
      </footer>
    </main>
  );
}
