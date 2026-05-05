import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YearCalendar } from "@/components/YearCalendar";
import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { calendarYearDescription, calendarYearTitle } from "@/lib/seo-metadata";
import { getTodayInTimeZone, getWeeksInIsoYear, getYearCalendar } from "@/lib/week";

type Props = {
  params: Promise<{ locale: string; year: string }>;
};

function parseYear(input: string): number | null {
  const year = Number(input);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return null;
  return year;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, year: yearInput } = await params;
  const year = parseYear(yearInput);
  if (!year || !isLocale(locale)) return {};
  const isFr = locale === "fr";
  const canonical = `https://whatweek.ca/${locale}/calendar/${year}`;
  const enPath = `https://whatweek.ca/en/calendar/${year}`;
  const frPath = `https://whatweek.ca/fr/calendar/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  const weeksInYear = getWeeksInIsoYear(year);
  const title = calendarYearTitle(locale, year);
  const description = calendarYearDescription(locale, year, weeksInYear);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": enPath,
        "fr-CA": frPath,
        "x-default": enPath,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CalendarYearPage({ params }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  const year = parseYear(yearInput);
  if (!year || !isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const weeksInYear = getWeeksInIsoYear(year);
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const months = getYearCalendar(year, today, "iso");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "fr" ? "Accueil" : "Home",
        item: `https://whatweek.ca/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: year.toString(),
        item: `https://whatweek.ca/${locale}/calendar/${year}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: locale === "fr" ? `Combien de semaines en ${year} ?` : `How many weeks in ${year}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: locale === "fr" 
            ? `L'année ${year} compte ${weeksInYear} semaines ISO.` 
            : `The year ${year} has ${weeksInYear} ISO weeks.`,
        },
      },
    ],
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader locale={locale} year={year} />
      
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "fr" ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{year}</span>
        </nav>
        
        <h1>{calendarYearTitle(locale, year)}</h1>
        <p className="subtle" style={{ maxWidth: "800px", margin: "0.75rem auto 0", lineHeight: 1.6 }}>
          {locale === "fr"
            ? `Vue d’ensemble de l’année ${year} au Canada : ${weeksInYear} semaines ISO, grille mensuelle avec numéros de semaine et liens vers chaque semaine. Pratique pour la planification, la paie et les congés.`
            : `Full-year ${year} view for Canada: ${weeksInYear} ISO weeks, a month-by-month grid with week numbers, and links into each week. Useful for planning, payroll, and holidays.`}
        </p>

        <nav className="yearNav" aria-label="Year navigation">
          <Link href={`/${locale}/calendar/${year - 1}`}>{year - 1}</Link>
          <span className="current">{year}</span>
          <Link href={`/${locale}/calendar/${year + 1}`}>{year + 1}</Link>
        </nav>
      </section>

      <YearCalendar dictionary={dictionary} locale={locale} months={months} year={year} system="iso" today={today} />

      <section className="panel contentSection">
        <h2>{locale === "fr" ? `À propos du calendrier ${year}` : `About the ${year} calendar`}</h2>
        <p>
          {locale === "fr" 
            ? `Consultez le calendrier complet de l'année ${year} avec les numéros de semaine ISO 8601. Idéal pour la planification professionnelle et la gestion de projet au Canada.`
            : `View the full ${year} calendar with ISO 8601 week numbers. Perfect for business planning and project management in Canada.`}
        </p>
      </section>
    </main>
  );
}
