import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BlogTeaser } from "@/components/BlogTeaser";
import { HolidayPanel } from "@/components/HolidayPanel";
import { SiteHeader, buildHomeHref } from "@/components/SiteHeader";
import { LongWeekendCard } from "@/components/LongWeekendCard";
import { ProvinceSelect } from "@/components/ProvinceSelect";
import { TodayHolidayBanner } from "@/components/TodayHolidayBanner";
import { YearCalendar } from "@/components/YearCalendar";
import { getHolidaysForDateRange, getNextLongWeekend } from "@/lib/holidays-ca";
import { getDictionary, isLocale, locales, toLocaleCode, type Locale } from "@/lib/i18n";
import { getProvinceTimeZone, isProvinceCode, provinceNames, type ProvinceCode } from "@/lib/provinces";
import {
  formatDateLong,
  getTodayInTimeZone,
  getWeekNumber,
  getWeeksInYear,
  getWeekSystem,
  getWeekYear,
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

  const dictionary = getDictionary(locale);
  const title = dictionary.metadataHomeTitle;
  const description =
    locale === "fr"
      ? "Voyez instantanément quelle semaine de l'année sommes-nous au Canada. Consultez le numéro de semaine actuel, les semaines parcourues, le jour de l'année et le calendrier complet."
      : "Instantly see what week of the year it is in Canada. View the current week number, weeks into the year, day of the year and full calendar.";
  const canonical = `https://whatweek.ca/${locale}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title: { absolute: title },
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

  if (query.year !== undefined && year !== defaultYear) {
    redirect(`/${locale}/calendar/${year}`);
  }

  const currentWeek = getWeekNumber(today, system);
  const localeCode = toLocaleCode(locale);
  const weeksInYear = getWeeksInYear(year, system);
  const firstDay = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const lastDay = new Date(Date.UTC(year, 11, 31, 12, 0, 0));
  const yearCalendar = getYearCalendar(year, today, system);
  const weekStart = startOfWeek(today, system);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const dayOfYear = Math.floor((today.getTime() - firstDay.getTime()) / 86_400_000) + 1;
  const weeksLeft = Math.max(0, weeksInYear - currentWeek);
  const weekYear = getWeekYear(today, system);
  const weekRangeText = `${formatDateLong(weekStart, localeCode, timeZone)} – ${formatDateLong(weekEnd, localeCode, timeZone)}`;
  const dayName = new Intl.DateTimeFormat(localeCode, { weekday: "long", timeZone }).format(today);
  const [holidays, nextLongWeekend] = await Promise.all([
    getHolidaysForDateRange(weekStart, weekEnd, province),
    getNextLongWeekend(year, today, province),
  ]);

  const todayKey = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
  const todayHoliday = holidays.find(
    (h) => `${h.date.getUTCFullYear()}-${h.date.getUTCMonth()}-${h.date.getUTCDate()}` === todayKey,
  ) ?? null;

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
  const faqEntries = dictionary.faq.entries(currentWeek, weeksInYear, year, dayOfYear, weekYear);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    isPartOf: { "@id": webpageId },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#faq-heading", ".heroLead", ".currentWeek"],
    },
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.a,
      },
    })),
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
    author: { "@id": orgId },
    about: { "@id": orgId },
    citation: ["https://date.nager.at/swagger/index.html"],
    isBasedOn: ["https://date.nager.at/swagger/index.html", "https://www.iso.org/iso-8601-date-and-time-format.html"],
  };

  const todayHolidayEvent = todayHoliday
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: locale === "fr" ? todayHoliday.nameFr : todayHoliday.nameEn,
        startDate: todayHoliday.date.toISOString().slice(0, 10),
        endDate: todayHoliday.date.toISOString().slice(0, 10),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: provinceName ?? (locale === "fr" ? "Canada" : "Canada"),
          address: {
            "@type": "PostalAddress",
            addressCountry: "CA",
            ...(province ? { addressRegion: province.replace("CA-", "") } : {}),
          },
        },
      }
    : null;

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd,
      websiteJsonLd,
      webpageJsonLd,
      faqJsonLd,
      ...(todayHolidayEvent ? [todayHolidayEvent] : []),
    ],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={year} province={province} system={system} />

      {todayHoliday && (
        <TodayHolidayBanner locale={locale} holiday={todayHoliday} province={province} year={year} />
      )}

      <section className="hero">
        <h1 className="homeH1">{dictionary.home.h1}</h1>
        <p className="subtle homeHeroAnswer">
          <strong>{dictionary.home.heroAnswer(currentWeek, year)}</strong>
        </p>
        <p className="subtle">
          {formatDateLong(weekStart, localeCode, timeZone)} – {formatDateLong(weekEnd, localeCode, timeZone)}
        </p>
        <p className="subtle heroLead">{dictionary.home.heroSupporting}</p>

        <div className="systemLinks">
          <Link
            href={buildHomeHref(locale, { year, province, system: "iso" })}
            prefetch={false}
            rel="nofollow"
            className={system === "iso" ? "systemActive" : undefined}
            aria-current={system === "iso" ? "page" : undefined}
          >
            ISO 8601
          </Link>
          <Link
            href={buildHomeHref(locale, { year, province, system: "canada" })}
            prefetch={false}
            rel="nofollow"
            className={system === "canada" ? "systemActive" : undefined}
            aria-current={system === "canada" ? "page" : undefined}
          >
            Canada
          </Link>
        </div>
        <p className="subtle systemNote">
          {locale === "fr"
            ? `Système de semaine : ${system === "canada" ? "Canada (dimanche à samedi)" : "ISO 8601 (lundi à dimanche)"}`
            : `Week system: ${system === "canada" ? "Canada (Sunday to Saturday)" : "ISO 8601 (Monday to Sunday)"}`}
        </p>

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
            href={`/${locale}/calendar/${year - 1}`}
            prefetch={false}
            aria-label={dictionary.prevYear}
          >
            {year - 1}
          </Link>
          <span>{year}</span>
          <Link
            href={`/${locale}/calendar/${year + 1}`}
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
        <h2>{locale === "fr" ? "Outils et calendriers" : "Tools & calendars"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/what-week-is-it`} prefetch={false}>
            {locale === "fr" ? "Quelle semaine?" : "What week is it?"}
          </Link>
          <Link href={`/${locale}/what-week-of-the-year-is-it`} prefetch={false}>
            {locale === "fr" ? "Semaine de l'année?" : "What week of the year?"}
          </Link>
          <Link href={`/${locale}/week-dates-and-iso-number`} prefetch={false}>
            {locale === "fr" ? "Dates et numéro ISO" : "Week dates & ISO number"}
          </Link>
          <Link href={`/${locale}/weeks-into-the-year`} prefetch={false}>
            {locale === "fr" ? "Semaines parcourues" : "Weeks into the year"}
          </Link>
          <Link href={`/${locale}/what-week-number`} prefetch={false}>
            {locale === "fr" ? "Numéro de semaine?" : "What week number?"}
          </Link>
          <Link href={`/${locale}/weeks-in-a-year`} prefetch={false}>
            {locale === "fr" ? "Semaines dans l'année" : "Weeks in a year"}
          </Link>
          <Link href={`/${locale}/what-day-of-the-year-is-it`} prefetch={false}>
            {locale === "fr" ? "Jour de l'année?" : "Day of the year?"}
          </Link>
          <Link href={`/${locale}/day-of-year-and-weekday`} prefetch={false}>
            {locale === "fr" ? "Jour & jour sem." : "Day of year & weekday"}
          </Link>
          <Link href={`/${locale}/what-day-of-the-week`} prefetch={false}>
            {locale === "fr" ? "Jour de la semaine?" : "Day of the week?"}
          </Link>
          <Link href={`/${locale}/weeks-and-months-calendar`} prefetch={false}>
            {locale === "fr" ? "Semaines et mois" : "Weeks and months"}
          </Link>
          <Link href={`/${locale}/calendar-year-view`} prefetch={false}>
            {locale === "fr" ? "Calendrier annuel" : "Calendar year view"}
          </Link>
          <Link href={`/${locale}/week-by-year-index`} prefetch={false}>
            {locale === "fr" ? "Semaine par année" : "Week by year index"}
          </Link>
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {locale === "fr" ? `Calendrier ${year}` : `${year} Calendar`}
          </Link>
          <Link href={`/${locale}/calendar/${year + 1}`} prefetch={false}>
            {locale === "fr" ? `Calendrier ${year + 1}` : `${year + 1} Calendar`}
          </Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {locale === "fr" ? "Date ↔ Semaine" : "Date ↔ Week converter"}
          </Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>
            {locale === "fr" ? "Jours ouvrables" : "Business days"}
          </Link>
          <Link href={`/${locale}/pay-period-calculator`} prefetch={false}>
            {locale === "fr" ? "Période de paie" : "Pay period"}
          </Link>
          <Link href={`/${locale}/long-weekends/${year}`} prefetch={false}>
            {locale === "fr" ? "Longs week-ends" : "Long weekends"}
          </Link>
        </div>
      </section>

      <section className="panel contentSection" aria-labelledby="faq-heading">
        <h2 id="faq-heading">{dictionary.faq.heading}</h2>
        {faqEntries.map((entry) => (
          <article key={entry.q} className="faqEntry">
            <h3>{entry.q}</h3>
            <p>{entry.a}</p>
          </article>
        ))}
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
