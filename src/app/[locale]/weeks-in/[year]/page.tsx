import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd } from "@/lib/seo-metadata";
import {
  formatDateLong,
  getIsoWeekNumber,
  getTodayInTimeZone,
  getWeeksInIsoYear,
  startOfIsoWeek,
} from "@/lib/week";
import { isLeapYear } from "@/lib/date-math";

const NOW_YEAR = new Date().getUTCFullYear();
const MIN_YEAR = NOW_YEAR - 5;
const MAX_YEAR = NOW_YEAR + 6;

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
  const weeks = getWeeksInIsoYear(year);
  const title = isFr
    ? `Combien de semaines en ${year} ? ${weeks} semaines ISO`
    : `How Many Weeks Are in ${year}? ${weeks} ISO Weeks`;
  const description = isFr
    ? `${year} compte ${weeks} semaines ISO 8601${weeks === 53 ? " (année à 53 semaines)" : ""}. Découvrez les dates de début et de fin et le calendrier complet.`
    : `${year} has ${weeks} ISO 8601 weeks${weeks === 53 ? " (a rare 53-week year)" : ""}. See the start and end dates and the full week-by-week calendar.`;
  const canonical = `https://whatweek.ca/${locale}/weeks-in/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/weeks-in/${year}`,
        "fr-CA": `https://whatweek.ca/fr/weeks-in/${year}`,
        "x-default": `https://whatweek.ca/en/weeks-in/${year}`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function WeeksInYearPage({ params }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const year = parseYear(yearInput);
  if (!year) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";

  const total = getWeeksInIsoYear(year);
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const todayIsoWeek = today.getUTCFullYear() === year ? getIsoWeekNumber(today) : null;

  // ISO week 1 starts on Monday on/before Jan 4.
  const week1Start = startOfIsoWeek(new Date(Date.UTC(year, 0, 4, 12, 0, 0)));
  const lastWeekStart = startOfIsoWeek(new Date(Date.UTC(year, 11, 28, 12, 0, 0)));
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setUTCDate(lastWeekStart.getUTCDate() + 6);

  const weeks = Array.from({ length: total }, (_, i) => {
    const weekNumber = i + 1;
    const start = new Date(week1Start);
    start.setUTCDate(week1Start.getUTCDate() + i * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    return { weekNumber, start, end };
  });

  const faq = [
    {
      question: isFr ? `Combien de semaines y a-t-il en ${year} ?` : `How many weeks are in ${year}?`,
      answer: isFr
        ? `${year} compte exactement ${total} semaines ISO 8601.`
        : `${year} contains exactly ${total} ISO 8601 weeks.`,
    },
    {
      question: isFr ? "Pourquoi certaines années ont 53 semaines ?" : "Why do some years have 53 weeks?",
      answer: isFr
        ? "Une année ISO a 53 semaines lorsque son premier jeudi tombe le 1ᵉʳ janvier (ou le 1ᵉʳ-2 janvier en année bissextile). Récents : 2009, 2015, 2020, 2026, 2032."
        : "An ISO year has 53 weeks when its first Thursday falls on January 1 (or January 1–2 in a leap year). Recent: 2009, 2015, 2020, 2026, 2032.",
    },
    {
      question: isFr ? `${year} est-elle bissextile ?` : `Is ${year} a leap year?`,
      answer: isFr
        ? `${year} ${isLeapYear(year) ? "est" : "n'est pas"} une année bissextile (${isLeapYear(year) ? 366 : 365} jours).`
        : `${year} ${isLeapYear(year) ? "is" : "is not"} a leap year (${isLeapYear(year) ? 366 : 365} days).`,
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(faqJsonLd) }} />
      <SiteHeader locale={locale} year={year} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? `Semaines en ${year}` : `Weeks in ${year}`}</span>
        </nav>
        <h1>{isFr ? `Combien de semaines en ${year} ?` : `How many weeks are in ${year}?`}</h1>
        <div className="keywordHero" style={{ marginTop: "1rem" }}>
          <div className="keywordHeroMetric">{total}</div>
          <div className="keywordHeroLabel">{isFr ? `semaines ISO en ${year}` : `ISO weeks in ${year}`}</div>
          <div className="keywordHeroSubtext">
            {total === 53 ? (isFr ? "Année à 53 semaines (rare)" : "A rare 53-week year") : isFr ? "Année standard à 52 semaines" : "Standard 52-week year"}
          </div>
        </div>
        <nav className="yearNav" aria-label={isFr ? "Année" : "Year"}>
          <Link href={`/${locale}/weeks-in/${year - 1}`} prefetch={false}>{year - 1}</Link>
          <span className="current">{year}</span>
          <Link href={`/${locale}/weeks-in/${year + 1}`} prefetch={false}>{year + 1}</Link>
        </nav>
      </section>

      <section className="panel">
        <h2>{isFr ? "Faits clés" : "Key facts"}</h2>
        <dl className="converterResults">
          <div>
            <dt>{isFr ? "Total semaines ISO" : "Total ISO weeks"}</dt>
            <dd><strong>{total}</strong></dd>
          </div>
          <div>
            <dt>{isFr ? "Semaine 1 commence" : "Week 1 starts"}</dt>
            <dd>{formatDateLong(week1Start, localeCode)}</dd>
          </div>
          <div>
            <dt>{isFr ? `Semaine ${total} se termine` : `Week ${total} ends`}</dt>
            <dd>{formatDateLong(lastWeekEnd, localeCode)}</dd>
          </div>
          <div>
            <dt>{isFr ? "Année bissextile" : "Leap year"}</dt>
            <dd>{isLeapYear(year) ? (isFr ? "Oui (366 jours)" : "Yes (366 days)") : isFr ? "Non (365 jours)" : "No (365 days)"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>{isFr ? "Toutes les semaines" : "All weeks"}</h2>
        <table className="payTable">
          <thead>
            <tr>
              <th>{isFr ? "Sem." : "Wk"}</th>
              <th>{isFr ? "Lundi" : "Monday"}</th>
              <th>{isFr ? "Dimanche" : "Sunday"}</th>
              <th>ISO</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((row) => (
              <tr key={row.weekNumber} className={row.weekNumber === todayIsoWeek ? "currentRow" : undefined}>
                <td>
                  <Link href={`/${locale}/week/${year}/${row.weekNumber}`} prefetch={false}>
                    <strong>W{row.weekNumber}</strong>
                  </Link>
                </td>
                <td>{formatDateLong(row.start, localeCode)}</td>
                <td>{formatDateLong(row.end, localeCode)}</td>
                <td>{year}-W{String(row.weekNumber).padStart(2, "0")}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <section className="panel quickLinks">
        <h2>{isFr ? "Outils liés" : "Related tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>{isFr ? `Calendrier ${year}` : `${year} calendar`}</Link>
          <Link href={`/${locale}/year/${year}`} prefetch={false}>{isFr ? `Faits ${year}` : `${year} facts`}</Link>
          <Link href={`/${locale}/day-of-year/${year}`} prefetch={false}>{isFr ? `Jour de l'année ${year}` : `${year} day of year`}</Link>
          <Link href={`/${locale}/weeks-in-a-year`} prefetch={false}>{isFr ? "Combien de semaines dans une année" : "How many weeks in a year"}</Link>
        </div>
      </section>
    </main>
  );
}
