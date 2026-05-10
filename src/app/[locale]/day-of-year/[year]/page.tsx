import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd } from "@/lib/seo-metadata";
import { dayOfYear, daysInYear, isLeapYear, ymd } from "@/lib/date-math";
import { formatDateLong, getIsoWeekNumber, getIsoWeekYear, getTodayInTimeZone } from "@/lib/week";

const NOW_YEAR = new Date().getUTCFullYear();
const MIN_YEAR = NOW_YEAR - 5;
const MAX_YEAR = NOW_YEAR + 5;

type Props = { params: Promise<{ locale: string; year: string }> };

function parseYear(input: string): number | null {
  const v = Number(input);
  if (!Number.isInteger(v) || v < MIN_YEAR || v > MAX_YEAR) return null;
  return v;
}

export function generateStaticParams() {
  const years: number[] = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y += 1) years.push(y);
  return locales.flatMap((locale) => years.map((year) => ({ locale, year: String(year) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, year: yearInput } = await params;
  if (!isLocale(locale)) return {};
  const year = parseYear(yearInput);
  if (!year) return {};
  const isFr = locale === "fr";
  const total = daysInYear(year);
  const title = isFr
    ? `Jour de l'année ${year} — les ${total} jours en liste`
    : `${year} Day of the Year — All ${total} Ordinal Days`;
  const description = isFr
    ? `Liste complète des ${total} jours de l'année ${year} avec jour de la semaine, date civile et numéro de semaine ISO.`
    : `Full list of all ${total} ordinal days in ${year} with weekday, calendar date, and ISO 8601 week number.`;
  const canonical = `https://whatweek.ca/${locale}/day-of-year/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/day-of-year/${year}`,
        "fr-CA": `https://whatweek.ca/fr/day-of-year/${year}`,
        "x-default": `https://whatweek.ca/en/day-of-year/${year}`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function DayOfYearPage({ params }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const year = parseYear(yearInput);
  if (!year) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";

  const total = daysInYear(year);
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const todayDoy = today.getUTCFullYear() === year ? dayOfYear(today) : null;

  const days: Array<{
    doy: number;
    iso: string;
    long: string;
    weekday: string;
    isoWeek: number;
    isoYear: number;
  }> = [];
  for (let i = 0; i < total; i += 1) {
    const date = new Date(Date.UTC(year, 0, 1 + i, 12, 0, 0));
    days.push({
      doy: i + 1,
      iso: ymd(date),
      long: formatDateLong(date, localeCode),
      weekday: new Intl.DateTimeFormat(localeCode, { weekday: "short", timeZone: "UTC" }).format(date),
      isoWeek: getIsoWeekNumber(date),
      isoYear: getIsoWeekYear(date),
    });
  }

  const faq = [
    {
      question: isFr ? `Combien de jours y a-t-il en ${year} ?` : `How many days are in ${year}?`,
      answer: isFr
        ? `${year} compte ${total} jours${isLeapYear(year) ? " (année bissextile)" : ""}.`
        : `${year} has ${total} days${isLeapYear(year) ? " (leap year)" : ""}.`,
    },
    {
      question: isFr ? "Qu'est-ce que le jour de l'année (jour ordinal) ?" : "What is the day of the year (ordinal day)?",
      answer: isFr
        ? "Le jour de l'année — aussi appelé jour ordinal, Julian day ou DOY — est le numéro du jour depuis le 1ᵉʳ janvier (1) jusqu'au 31 décembre (365 ou 366)."
        : "The day of the year — also called the ordinal day, Julian day, or DOY — is the day number counted from January 1 (1) through December 31 (365 or 366).",
    },
    {
      question: isFr ? "Comment trouver le numéro de semaine ISO ?" : "How do I find the ISO week number?",
      answer: isFr
        ? "Chaque ligne du tableau affiche la semaine ISO correspondante. Pour des conversions interactives, utilisez le convertisseur date ↔ semaine."
        : "Each row in the table shows the corresponding ISO week. For interactive conversions, use the date ↔ week converter.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  // Group by month for navigability, but render compactly.
  const months: Array<{ name: string; rows: typeof days }> = [];
  for (let m = 0; m < 12; m += 1) {
    const name = new Intl.DateTimeFormat(localeCode, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, m, 15, 12, 0, 0)));
    months.push({
      name,
      rows: days.filter((row) => Number(row.iso.slice(5, 7)) - 1 === m),
    });
  }

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(faqJsonLd) }} />
      <SiteHeader locale={locale} year={year} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? `Jour de l'année ${year}` : `${year} day of the year`}</span>
        </nav>
        <h1>{isFr ? `Jour de l'année ${year}` : `${year} Day of the Year`}</h1>
        <p className="subtle heroLead">
          {isFr
            ? `${total} jours dans ${year}${isLeapYear(year) ? " (année bissextile)" : ""}. Chaque jour est listé avec son numéro ordinal, son jour de la semaine et sa semaine ISO 8601.`
            : `${total} days in ${year}${isLeapYear(year) ? " (leap year)" : ""}. Each day is listed with its ordinal number, weekday, and ISO 8601 week.`}
        </p>
        {todayDoy && (
          <p className="currentWeek" style={{ marginTop: "1rem" }}>
            <strong>{todayDoy}</strong>
            <span className="subtle">{isFr ? "jour de l'année aujourd'hui" : "day of the year today"}</span>
          </p>
        )}
        <nav className="yearNav" aria-label={isFr ? "Année" : "Year"}>
          <Link href={`/${locale}/day-of-year/${year - 1}`} prefetch={false}>{year - 1}</Link>
          <span className="current">{year}</span>
          <Link href={`/${locale}/day-of-year/${year + 1}`} prefetch={false}>{year + 1}</Link>
        </nav>
      </section>

      {months.map((month) => (
        <section key={month.name} className="panel">
          <h2>{month.name}</h2>
          <table className="payTable">
            <thead>
              <tr>
                <th>{isFr ? "Jour" : "DOY"}</th>
                <th>{isFr ? "Date" : "Date"}</th>
                <th>{isFr ? "Sem." : "Wk"}</th>
                <th>{isFr ? "Jour" : "Weekday"}</th>
              </tr>
            </thead>
            <tbody>
              {month.rows.map((row) => (
                <tr key={row.iso} className={row.doy === todayDoy ? "currentRow" : undefined}>
                  <td><strong>{row.doy}</strong></td>
                  <td>{row.long}</td>
                  <td>W{row.isoWeek}</td>
                  <td>{row.weekday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section className="panel contentSection">
        <h2>{isFr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
        {faq.map((entry) => (
          <article key={entry.question} className="faqEntry">
            <h3>{entry.question}</h3>
            <p>{entry.answer}</p>
          </article>
        ))}
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Outils liés" : "Related tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>{isFr ? `Calendrier ${year}` : `${year} calendar`}</Link>
          <Link href={`/${locale}/year/${year}`} prefetch={false}>{isFr ? `Faits ${year}` : `${year} facts`}</Link>
          <Link href={`/${locale}/weeks-in/${year}`} prefetch={false}>{isFr ? `Semaines en ${year}` : `Weeks in ${year}`}</Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date ↔ semaine" : "Date ↔ week"}</Link>
        </div>
      </section>
    </main>
  );
}
