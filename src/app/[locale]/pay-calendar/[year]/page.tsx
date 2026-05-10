import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getHolidaysForYear, type Holiday } from "@/lib/holidays-ca";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd } from "@/lib/seo-metadata";
import { formatDateLong, getIsoWeekNumber, getTodayInTimeZone } from "@/lib/week";
import { addDays, ymd } from "@/lib/date-math";

type Props = {
  params: Promise<{ locale: string; year: string }>;
  searchParams: Promise<{ frequency?: string; anchor?: string }>;
};

const NOW_YEAR = new Date().getUTCFullYear();
const MIN_YEAR = NOW_YEAR - 3;
const MAX_YEAR = NOW_YEAR + 5;

type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

function parseYear(input: string): number | null {
  const v = Number(input);
  if (!Number.isInteger(v) || v < MIN_YEAR || v > MAX_YEAR) return null;
  return v;
}

function parseFrequency(input: string | undefined): Frequency {
  if (input === "weekly" || input === "biweekly" || input === "semimonthly" || input === "monthly") return input;
  return "biweekly";
}

function defaultAnchorForYear(year: number): Date {
  // First Friday of the year as a reasonable bi-weekly anchor.
  const firstOfYear = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const day = firstOfYear.getUTCDay();
  const offset = (5 - day + 7) % 7;
  return addDays(firstOfYear, offset);
}

function buildHolidaySet(holidays: Holiday[]): Map<string, Holiday> {
  const map = new Map<string, Holiday>();
  for (const h of holidays) {
    if (h.global || h.global === undefined) {
      map.set(ymd(h.date), h);
    }
  }
  return map;
}

function shiftEarlierBusinessDay(date: Date, holidayMap: Map<string, Holiday>): Date {
  let cursor = new Date(date);
  while (cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6 || holidayMap.has(ymd(cursor))) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}

function generateSchedule(year: number, frequency: Frequency, anchor: Date, holidayMap: Map<string, Holiday>) {
  const out: Array<{
    scheduled: Date;
    paid: Date;
    shifted: boolean;
    holiday: Holiday | null;
    isoWeek: number;
  }> = [];

  let cursor = new Date(anchor);
  let safety = 0;
  while (cursor.getUTCFullYear() <= year && safety < 80) {
    if (cursor.getUTCFullYear() === year) {
      const holiday = holidayMap.get(ymd(cursor)) ?? null;
      const isWeekend = cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6;
      const paid = (holiday !== null || isWeekend)
        ? shiftEarlierBusinessDay(cursor, holidayMap)
        : new Date(cursor);
      out.push({
        scheduled: new Date(cursor),
        paid,
        shifted: paid.getTime() !== cursor.getTime(),
        holiday,
        isoWeek: getIsoWeekNumber(paid),
      });
    }
    if (frequency === "weekly") cursor = addDays(cursor, 7);
    else if (frequency === "biweekly") cursor = addDays(cursor, 14);
    else if (frequency === "semimonthly") {
      // Alternate between the 15th and last day of month if anchor close to 1st;
      // simpler approach: step 15-16 days alternating.
      cursor = addDays(cursor, out.length % 2 === 0 ? 15 : 16);
    } else {
      const m = cursor.getUTCMonth() + 1;
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), m, cursor.getUTCDate(), 12, 0, 0));
    }
    safety += 1;
  }

  return out;
}

function frequencyLabel(freq: Frequency, locale: Locale): string {
  const isFr = locale === "fr";
  if (freq === "weekly") return isFr ? "hebdomadaire" : "weekly";
  if (freq === "biweekly") return isFr ? "aux 2 semaines" : "bi-weekly";
  if (freq === "semimonthly") return isFr ? "bimensuel" : "semi-monthly";
  return isFr ? "mensuel" : "monthly";
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
  const title = isFr ? `Calendrier de paie ${year} au Canada` : `${year} Bi-Weekly Pay Calendar Canada`;
  const description = isFr
    ? `Calendrier de paie complet pour ${year} au Canada — 26 paies aux 2 semaines, dates décalées en cas de jour férié, semaine ISO pour chaque paie.`
    : `Complete ${year} pay calendar for Canada — 26 bi-weekly paydays with holiday-shifted dates and ISO week numbers. Free download.`;
  const canonical = `https://whatweek.ca/${locale}/pay-calendar/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/pay-calendar/${year}`,
        "fr-CA": `https://whatweek.ca/fr/pay-calendar/${year}`,
        "x-default": `https://whatweek.ca/en/pay-calendar/${year}`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function PayCalendarPage({ params, searchParams }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const year = parseYear(yearInput);
  if (!year) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";

  const query = await searchParams;
  const frequency = parseFrequency(query.frequency);
  const anchor = defaultAnchorForYear(year);

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const yearsToFetch = [year - 1, year, year + 1];
  const holidayLists = await Promise.all(yearsToFetch.map((y) => getHolidaysForYear(y)));
  const holidayMap = buildHolidaySet(holidayLists.flat());

  const schedule = generateSchedule(year, frequency, anchor, holidayMap);

  const faq = [
    {
      question: isFr ? `Combien de paies y a-t-il en ${year} ?` : `How many paydays are in ${year}?`,
      answer: isFr
        ? `${year} compte ${schedule.length} paies ${frequencyLabel(frequency, locale)}.`
        : `${year} has ${schedule.length} ${frequencyLabel(frequency, locale)} paydays.`,
    },
    {
      question: isFr ? "Que se passe-t-il quand la paie tombe un jour férié ?" : "What happens when payday falls on a holiday?",
      answer: isFr
        ? "Au Canada, la pratique est d'avancer la paie au jour ouvrable précédent (vendredi pour les week-ends, jour ouvrable précédent pour les fériés)."
        : "In Canada, payday is shifted to the previous business day (Friday for weekends, previous business day for stat holidays).",
    },
    {
      question: isFr ? "Cette page peut-elle servir pour la paie réelle ?" : "Can I use this page for real payroll?",
      answer: isFr
        ? "C'est un guide de planification. Pour les remises ARC et les feuilles de paie, utilisez votre logiciel de paie ou consultez votre comptable."
        : "It's a planning guide. For CRA remittance and pay stubs, use your payroll software or consult an accountant.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isFr ? `Calendrier de paie ${year}` : `${year} pay calendar`,
    itemListElement: schedule.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: isFr ? `Paie ${index + 1}` : `Payday ${index + 1}`,
      startDate: ymd(row.paid),
    })),
  };
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [faqJsonLd, itemListJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const upcomingIndex = schedule.findIndex((row) => row.paid.getTime() >= today.getTime());

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={year} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? `Calendrier de paie ${year}` : `${year} pay calendar`}</span>
        </nav>
        <h1>{isFr ? `Calendrier de paie ${year} au Canada` : `${year} Pay Calendar Canada`}</h1>
        <p className="subtle heroLead">
          {isFr
            ? `${schedule.length} paies ${frequencyLabel(frequency, locale)} en ${year}, ancrage au premier vendredi (${formatDateLong(anchor, localeCode)}). Pour personnaliser l'ancrage et la province, voir la calculatrice interactive.`
            : `${schedule.length} ${frequencyLabel(frequency, locale)} paydays in ${year}, anchored to the first Friday (${formatDateLong(anchor, localeCode)}). To customise the anchor and province, use the interactive calculator.`}
        </p>
        <nav className="yearNav" aria-label={isFr ? "Année" : "Year"}>
          <Link href={`/${locale}/pay-calendar/${year - 1}`} prefetch={false}>{year - 1}</Link>
          <span className="current">{year}</span>
          <Link href={`/${locale}/pay-calendar/${year + 1}`} prefetch={false}>{year + 1}</Link>
        </nav>
        <div className="systemLinks" style={{ marginTop: "1rem" }}>
          {(["weekly", "biweekly", "semimonthly", "monthly"] as Frequency[]).map((freq) => (
            <Link
              key={freq}
              href={`/${locale}/pay-calendar/${year}?frequency=${freq}`}
              prefetch={false}
              className={frequency === freq ? "systemActive" : undefined}
            >
              {frequencyLabel(freq, locale)}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{isFr ? "Calendrier" : "Schedule"}</h2>
        <table className="payTable">
          <thead>
            <tr>
              <th>#</th>
              <th>{isFr ? "Date prévue" : "Scheduled"}</th>
              <th>{isFr ? "Date de paie" : "Pay date"}</th>
              <th>{isFr ? "Sem." : "Wk"}</th>
              <th>{isFr ? "Note" : "Note"}</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, index) => (
              <tr
                key={ymd(row.scheduled) + index}
                className={row.shifted ? "payShifted" : index === upcomingIndex ? "currentRow" : undefined}
              >
                <td>{index + 1}</td>
                <td>{formatDateLong(row.scheduled, localeCode)}</td>
                <td><strong>{formatDateLong(row.paid, localeCode)}</strong></td>
                <td>W{row.isoWeek}</td>
                <td className="subtle">
                  {row.shifted
                    ? row.holiday
                      ? (isFr ? `Avancé (${row.holiday.nameFr})` : `Shifted (${row.holiday.nameEn})`)
                      : (isFr ? "Avancé (week-end)" : "Shifted (weekend)")
                    : index === upcomingIndex
                      ? (isFr ? "Prochaine paie" : "Next payday")
                      : ""}
                </td>
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
          <Link href={`/${locale}/pay-period-calculator`} prefetch={false}>{isFr ? "Calculatrice paie" : "Pay calculator (custom)"}</Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>{isFr ? "Jours ouvrables" : "Business days"}</Link>
          <Link href={`/${locale}/long-weekends/${year}`} prefetch={false}>{isFr ? `Longs week-ends ${year}` : `${year} long weekends`}</Link>
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>{isFr ? `Calendrier ${year}` : `${year} calendar`}</Link>
        </div>
      </section>
    </main>
  );
}
