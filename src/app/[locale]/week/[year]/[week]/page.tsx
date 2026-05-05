import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { getSeoOverride } from "@/lib/seo-overrides";
import { getIsoWeekPeriodStart, weekDetailDescription, weekDetailTitle } from "@/lib/seo-metadata";
import { formatDateLong, getWeeksInIsoYear } from "@/lib/week";

type Props = {
  params: Promise<{ locale: string; year: string; week: string }>;
};

function parseYear(input: string): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1900 || value > 2100) return null;
  return value;
}

function parseWeek(input: string): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1 || value > 53) return null;
  return value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, year: yearInput, week: weekInput } = await params;
  const year = parseYear(yearInput);
  const week = parseWeek(weekInput);
  if (!year || !week || !isLocale(locale)) return {};
  const isFr = locale === "fr";
  const canonical = `https://whatweek.ca/${locale}/week/${year}/${week}`;
  const enPath = `https://whatweek.ca/en/week/${year}/${week}`;
  const frPath = `https://whatweek.ca/fr/week/${year}/${week}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  
  const path = `/${locale}/week/${year}/${week}`;
  const override = getSeoOverride(path);

  const builtTitle = weekDetailTitle(locale, year, week);
  const builtDescription = weekDetailDescription(locale, year, week);
  const title = override?.title ?? builtTitle;
  const description = override?.description ?? builtDescription;

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

export default async function WeekDetailPage({ params }: Props) {
  const { locale: localeInput, year: yearInput, week: weekInput } = await params;
  const year = parseYear(yearInput);
  const week = parseWeek(weekInput);
  if (!year || !week || !isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const maxWeeks = getWeeksInIsoYear(year);
  if (week > maxWeeks) notFound();

  const start = getIsoWeekPeriodStart(year, week);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const dateLocale = locale === "fr" ? "fr-CA" : "en-CA";

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
      {
        "@type": "ListItem",
        position: 3,
        name: `${locale === "fr" ? "Semaine" : "Week"} ${week}`,
        item: `https://whatweek.ca/${locale}/week/${year}/${week}`,
      },
    ],
  };

  const nextWeek = week === maxWeeks ? 1 : week + 1;
  const nextYear = week === maxWeeks ? year + 1 : year;
  const prevWeek = week === 1 ? getWeeksInIsoYear(year - 1) : week - 1;
  const prevYear = week === 1 ? year - 1 : year;

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <SiteHeader locale={locale} year={year} />
      
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "fr" ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <Link href={`/${locale}/calendar/${year}`}>{year}</Link>
          <span> / </span>
          <span>{locale === "fr" ? "Semaine" : "Week"} {week}</span>
        </nav>

        <h1>{locale === "fr" ? `Semaine ${week} de ${year} au Canada` : `Week ${week} of ${year} in Canada`}</h1>
        <p className="subtle" style={{ maxWidth: "800px", margin: "1rem auto", lineHeight: 1.6 }}>
          {locale === "fr"
            ? `Vous consultez les détails de la semaine ${week} de l'année ${year} au Canada. Cette semaine spécifique commence le ${formatDateLong(start, dateLocale)} et se termine le ${formatDateLong(end, dateLocale)}. Cet aperçu temporel est très utile pour la planification commerciale, la paie, l'école et la gestion des vacances selon la norme ISO 8601.`
            : `Viewing details for week ${week} of ${year} in Canada. This specific week starts on ${formatDateLong(start, dateLocale)} and ends on ${formatDateLong(end, dateLocale)}. This timeline is extremely useful for business planning, payroll, school schedules, and holiday management according to the ISO 8601 standard.`}
        </p>

        <nav className="yearNav" aria-label="Week navigation">
          <Link href={`/${locale}/week/${prevYear}/${prevWeek}`}>
            {locale === "fr" ? "Précédente" : "Previous"}
          </Link>
          <span className="current">{locale === "fr" ? "Semaine" : "Week"} {week}</span>
          <Link href={`/${locale}/week/${nextYear}/${nextWeek}`}>
            {locale === "fr" ? "Suivante" : "Next"}
          </Link>
        </nav>
      </section>

      <section className="panel contentSection">
        <h2>{locale === "fr" ? `Détails de la semaine ${week}` : `Week ${week} details`}</h2>
        <p>
          {locale === "fr"
            ? `La semaine ${week} de l'année ${year} commence le ${formatDateLong(start, dateLocale)} et se termine le ${formatDateLong(end, dateLocale)}.`
            : `Week ${week} of ${year} begins on ${formatDateLong(start, dateLocale)} and ends on ${formatDateLong(end, dateLocale)}.`}
        </p>
      </section>

      <section className="panel quickLinks">
        <h2>{locale === "fr" ? "Liens utiles" : "Useful links"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/calendar/${year}`}>{locale === "fr" ? `Calendrier ${year}` : `${year} Calendar`}</Link>
          <Link href={`/${locale}/current-week-number-canada`}>{locale === "fr" ? "Semaine Actuelle" : "Current Week"}</Link>
        </div>
      </section>
    </main>
  );
}
