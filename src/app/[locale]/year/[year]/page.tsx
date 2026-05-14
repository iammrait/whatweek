import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getHolidaysForYearByProvince, getLongWeekendsForYear } from "@/lib/holidays-ca";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { provinceCodes, provinceNames } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo-metadata";
import { formatDateLong, getWeeksInIsoYear } from "@/lib/week";

const MIN_YEAR = new Date().getUTCFullYear() - 5;
const MAX_YEAR = new Date().getUTCFullYear() + 6;

type Props = {
  params: Promise<{ locale: string; year: string }>;
};

function parseYear(input: string): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < MIN_YEAR || value > MAX_YEAR) return null;
  return value;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function countWeekendDays(year: number): number {
  let weekendDays = 0;
  const cursor = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  while (cursor.getUTCFullYear() === year) {
    const day = cursor.getUTCDay();
    if (day === 0 || day === 6) weekendDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return weekendDays;
}

export function generateStaticParams() {
  const years: number[] = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) years.push(year);
  return locales.flatMap((locale) =>
    years.map((year) => ({ locale, year: String(year) })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, year: yearInput } = await params;
  if (!isLocale(locale)) return {};
  const year = parseYear(yearInput);
  if (!year) return {};
  const isFr = locale === "fr";
  const title = isFr ? `${year} au Canada — faits, semaines et jours fériés` : `${year} Canada — facts, weeks, and holidays`;
  const description = isFr
    ? `Tout sur l’année ${year} au Canada : nombre de semaines ISO, jours ouvrables, jours fériés fédéraux et longs week-ends en un coup d’œil.`
    : `Everything about ${year} in Canada at a glance: ISO weeks, working days, federal holidays, and the year’s long weekends.`;
  const canonical = `https://whatweek.ca/${locale}/year/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/year/${year}`,
        "fr-CA": `https://whatweek.ca/fr/year/${year}`,
        "x-default": `https://whatweek.ca/en/year/${year}`,
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

export default async function YearFactsPage({ params }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const year = parseYear(yearInput);
  if (!year) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";

  const [holidays, longWeekends] = await Promise.all([
    getHolidaysForYearByProvince(year, null),
    getLongWeekendsForYear(year, null),
  ]);

  const totalDays = isLeapYear(year) ? 366 : 365;
  const weekendDays = countWeekendDays(year);
  const weeksInYear = getWeeksInIsoYear(year);
  const workingDays = totalDays - weekendDays - holidays.length;

  const yearStart = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 12, 0, 0));

  const faq = [
    {
      question: isFr
        ? `Combien de semaines y a-t-il en ${year} ?`
        : `How many weeks are in ${year}?`,
      answer: isFr
        ? `${year} compte ${weeksInYear} semaines ISO 8601.`
        : `${year} contains ${weeksInYear} ISO 8601 weeks.`,
    },
    {
      question: isFr
        ? `Combien de jours ouvrables y a-t-il en ${year} ?`
        : `How many working days are in ${year}?`,
      answer: isFr
        ? `${year} compte environ ${workingDays} jours ouvrables au Canada (fédéral) — ${totalDays} jours moins ${weekendDays} jours de week-end et ${holidays.length} jours fériés statutaires.`
        : `${year} has approximately ${workingDays} working days in Canada (federal) — ${totalDays} total days minus ${weekendDays} weekend days and ${holidays.length} statutory holidays.`,
    },
    {
      question: isFr ? `${year} est-elle bissextile ?` : `Is ${year} a leap year?`,
      answer: isFr
        ? `${year} ${isLeapYear(year) ? "est" : "n’est pas"} une année bissextile.`
        : `${year} ${isLeapYear(year) ? "is" : "is not"} a leap year.`,
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? `Année ${year}` : `Year ${year}`, path: `/year/${year}` },
  ]);
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [breadcrumbJsonLd, faqJsonLd] };

  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={year} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{year}</span>
        </nav>
        <h1>{isFr ? `${year} au Canada` : `${year} in Canada`}</h1>
        <p className="subtle heroLead">
          {isFr
            ? `Du ${formatDateLong(yearStart, localeCode)} au ${formatDateLong(yearEnd, localeCode)}. Voici les chiffres clés à connaître.`
            : `From ${formatDateLong(yearStart, localeCode)} to ${formatDateLong(yearEnd, localeCode)}. Here are the key numbers to know.`}
        </p>
        <nav className="yearNav" aria-label={isFr ? "Navigation année" : "Year navigation"}>
          <Link href={`/${locale}/year/${year - 1}`} prefetch={false}>
            {year - 1}
          </Link>
          <span className="current">{year}</span>
          <Link href={`/${locale}/year/${year + 1}`} prefetch={false}>
            {year + 1}
          </Link>
        </nav>
      </section>

      <section className="panel">
        <h2>{isFr ? "Faits clés" : "Key facts"}</h2>
        <dl className="converterResults">
          <div>
            <dt>{isFr ? "Semaines ISO" : "ISO weeks"}</dt>
            <dd>
              <strong>{weeksInYear}</strong>
            </dd>
          </div>
          <div>
            <dt>{isFr ? "Jours" : "Days"}</dt>
            <dd>{totalDays}</dd>
          </div>
          <div>
            <dt>{isFr ? "Jours ouvrables" : "Working days"}</dt>
            <dd>{workingDays}</dd>
          </div>
          <div>
            <dt>{isFr ? "Week-ends (jours)" : "Weekend days"}</dt>
            <dd>{weekendDays}</dd>
          </div>
          <div>
            <dt>{isFr ? "Jours fériés (fédéral)" : "Holidays (federal)"}</dt>
            <dd>{holidays.length}</dd>
          </div>
          <div>
            <dt>{isFr ? "Année bissextile" : "Leap year"}</dt>
            <dd>{isLeapYear(year) ? (isFr ? "Oui" : "Yes") : isFr ? "Non" : "No"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{isFr ? "Jours fériés fédéraux" : "Federal statutory holidays"}</h2>
        <table className="holidayTable">
          <thead>
            <tr>
              <th>{isFr ? "Date" : "Date"}</th>
              <th>{isFr ? "Nom" : "Name"}</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.date.toISOString()}>
                <td>{formatDateLong(holiday.date, localeCode)}</td>
                <td>
                  <strong>{isFr ? holiday.nameFr : holiday.nameEn}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <Link href={`/${locale}/long-weekends/${year}`} prefetch={false}>
            {isFr ? `Voir les ${longWeekends.length} longs week-ends →` : `See the ${longWeekends.length} long weekends →`}
          </Link>
        </p>
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Voir par province" : "View by province"}</h2>
        <div className="linkGrid">
          {provinceCodes.map((code) => (
            <Link
              key={code}
              href={`/${locale}/statutory-holidays/${code.replace("CA-", "").toLowerCase()}/${year}`}
              prefetch={false}
            >
              {provinceNames[code][locale]}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Outils" : "Tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {isFr ? `Calendrier ${year}` : `${year} calendar`}
          </Link>
          <Link href={`/${locale}/long-weekends/${year}`} prefetch={false}>
            {isFr ? `Longs week-ends ${year}` : `${year} long weekends`}
          </Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {isFr ? "Date ↔ semaine" : "Date ↔ week"}
          </Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>
            {isFr ? "Jours ouvrables" : "Business days"}
          </Link>
          <Link href={`/${locale}/pay-period-calculator`} prefetch={false}>
            {isFr ? "Périodes de paie" : "Pay periods"}
          </Link>
        </div>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
        {faq.map((entry) => (
          <article key={entry.question} className="faqEntry">
            <h3>{entry.question}</h3>
            <p>{entry.answer}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
