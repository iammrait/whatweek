import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getHolidaysForDateRange } from "@/lib/holidays-ca";
import { SiteHeader } from "@/components/SiteHeader";
import { getSeoOverride } from "@/lib/seo-overrides";
import { buildBreadcrumbJsonLd, getIsoWeekPeriodStart, weekDetailDescription, weekDetailTitle } from "@/lib/seo-metadata";
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
    keywords: isFr
      ? [`semaine ${week} ${year}`, `détails semaine ${week}`, `dates semaine ${week}`, `calendrier semaine ${week}`]
      : [`week ${week} ${year}`, `week ${week} details`, `week ${week} dates`, `week ${week} calendar`],
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

  const holidaysInWeek = await getHolidaysForDateRange(start, end, null);
  const holidayNames =
    holidaysInWeek.length > 0
      ? holidaysInWeek.map((h) => (locale === "fr" ? h.nameFr : h.nameEn)).join(", ")
      : null;

  const canonical = `https://whatweek.ca/${locale}/week/${year}/${week}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: year.toString(), path: `/calendar/${year}` },
    { name: `${locale === "fr" ? "Semaine" : "Week"} ${week}`, path: `/week/${year}/${week}` },
  ]);

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name:
          locale === "fr"
            ? `Quelles dates couvre la semaine ${week} de l’année de semaine ISO ${year} ?`
            : `What dates does ISO week ${week} of ISO week-year ${year} cover?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? `La semaine ${week} (${year}) commence le ${formatDateLong(start, dateLocale)} et se termine le ${formatDateLong(end, dateLocale)}, selon la norme ISO 8601 (lundi à dimanche).`
              : `Week ${week} of ${year} begins on ${formatDateLong(start, dateLocale)} and ends on ${formatDateLong(end, dateLocale)}, per ISO 8601 (Monday through Sunday).`,
        },
      },
      {
        "@type": "Question",
        name:
          locale === "fr"
            ? `Quels jours fériés fédéraux tombent dans la semaine ${week} (${year}) ?`
            : `What federal statutory holidays fall in ISO week ${week} of ${year}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: holidayNames
            ? locale === "fr"
              ? `Pour la plage de dates affichée, les jours fériés à caractère national suivants tombent dans cette semaine : ${holidayNames}. Les jours fériés provinciaux varient selon la province.`
              : `For the displayed date range, these nationally relevant statutory holidays fall in this week: ${holidayNames}. Province-specific observed holidays vary.`
            : locale === "fr"
              ? "Aucun jour férié fédéral à caractère national ne tombe sur ces dates. Des jours fériés provinciaux peuvent tout de même s’appliquer—utilisez le calendrier de la page d’accueil avec une province sélectionnée."
              : "No nationally scoped federal statutory holidays fall on these dates. Province-specific holidays may still apply—use the home calendar with a province selected.",
        },
      },
      {
        "@type": "Question",
        name:
          locale === "fr"
            ? "Cette page utilise-t-elle le calendrier de semaines ISO 8601 ?"
            : "Does this page use the ISO 8601 week calendar?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? "Oui. Les numéros de semaine et les dates correspondent à la semaine ISO (lundi–dimanche) pour l’année de semaine ISO indiquée dans l’URL, ce qui est courant pour la paie et les outils internationaux."
              : "Yes. Week numbers and dates follow ISO weeks (Monday–Sunday) for the ISO week-year shown in the URL, which is common for payroll tooling and international alignment.",
        },
      },
    ],
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, faqJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const nextWeek = week === maxWeeks ? 1 : week + 1;
  const nextYear = week === maxWeeks ? year + 1 : year;
  const prevWeek = week === 1 ? getWeeksInIsoYear(year - 1) : week - 1;
  const prevYear = week === 1 ? year - 1 : year;

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={year} />
      
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {locale === "fr" ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {year}
          </Link>
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
          <Link href={`/${locale}/week/${prevYear}/${prevWeek}`} prefetch={false}>
            {locale === "fr" ? "Précédente" : "Previous"}
          </Link>
          <span className="current">{locale === "fr" ? "Semaine" : "Week"} {week}</span>
          <Link href={`/${locale}/week/${nextYear}/${nextWeek}`} prefetch={false}>
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
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {locale === "fr" ? `Calendrier ${year}` : `${year} Calendar`}
          </Link>
          <Link href={`/${locale}/current-week-number-canada`} prefetch={false}>
            {locale === "fr" ? "Semaine Actuelle" : "Current Week"}
          </Link>
          <Link href={`/${locale}/what-week-of-the-year-is-it`} prefetch={false}>
            {locale === "fr" ? "Quelle semaine de l'année?" : "What week of the year is it?"}
          </Link>
          <Link href={`/${locale}/weeks-in-a-year`} prefetch={false}>
            {locale === "fr" ? "Semaines dans une année" : "Weeks in a year"}
          </Link>
        </div>
      </section>
    </main>
  );
}
