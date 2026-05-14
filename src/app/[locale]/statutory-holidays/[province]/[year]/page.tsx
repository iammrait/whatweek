import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getHolidaysForYearByProvince, getLongWeekendsForYear } from "@/lib/holidays-ca";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { isProvinceCode, provinceCodes, provinceNames, type ProvinceCode } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildWebPageJsonLd } from "@/lib/seo-metadata";
import { getSitemapLastmod } from "@/lib/sitemap-lastmod";
import { formatDateLong, getIsoWeekNumber } from "@/lib/week";

const MIN_YEAR = new Date().getUTCFullYear() - 2;
const MAX_YEAR = new Date().getUTCFullYear() + 4;

type Props = {
  params: Promise<{ locale: string; province: string; year: string }>;
};

function parseYear(input: string): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < MIN_YEAR || value > MAX_YEAR) return null;
  return value;
}

function parseProvinceParam(input: string): ProvinceCode | null {
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

function provinceShortCode(code: ProvinceCode): string {
  return code.replace("CA-", "").toLowerCase();
}

export function generateStaticParams() {
  const years: number[] = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) years.push(year);
  return locales.flatMap((locale) =>
    provinceCodes.flatMap((province) =>
      years.map((year) => ({
        locale,
        province: provinceShortCode(province),
        year: String(year),
      })),
    ),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, province: provinceInput, year: yearInput } = await params;
  if (!isLocale(locale)) return {};
  const province = parseProvinceParam(provinceInput);
  const year = parseYear(yearInput);
  if (!province || !year) return {};

  const isFr = locale === "fr";
  const geo = provinceNames[province][locale];
  const title = isFr
    ? `Jours fériés ${year} — ${geo}`
    : `${year} statutory holidays in ${geo}`;
  const description = isFr
    ? `Liste complète des jours fériés en ${geo} pour ${year} avec dates, jour de la semaine et flux iCalendar à ajouter à votre agenda.`
    : `Full list of ${year} statutory holidays in ${geo} with weekday, observed date, and an iCalendar feed you can subscribe to.`;
  const slug = provinceShortCode(province);
  const canonical = `https://whatweek.ca/${locale}/statutory-holidays/${slug}/${year}`;
  const enPath = `https://whatweek.ca/en/statutory-holidays/${slug}/${year}`;
  const frPath = `https://whatweek.ca/fr/statutory-holidays/${slug}/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    keywords: isFr
      ? [`jours fériés ${year} ${geo}`, `congés statutaires ${year}`, `calendrier fériés ${province}`, `fêtes canada ${year}`]
      : [`${year} holidays ${geo}`, `statutory holidays ${year}`, `${province} holiday calendar`, `canada public holidays ${year}`],
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

export default async function ProvinceHolidaysPage({ params }: Props) {
  const { locale: localeInput, province: provinceInput, year: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const province = parseProvinceParam(provinceInput);
  const year = parseYear(yearInput);
  if (!province || !year) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const geo = provinceNames[province][locale];
  const slug = provinceShortCode(province);

  const [holidays, longWeekends] = await Promise.all([
    getHolidaysForYearByProvince(year, province),
    getLongWeekendsForYear(year, province),
  ]);

  const icsHref = `/api/holidays.ics?province=${slug}&year=${year}&locale=${locale}`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Jours fériés" : "Statutory holidays", path: `/statutory-holidays/${slug}/${year}` },
    { name: `${geo} ${year}`, path: `/statutory-holidays/${slug}/${year}` },
  ]);

  const eventsJsonLd = holidays.map((holiday) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: isFr ? holiday.nameFr : holiday.nameEn,
    startDate: holiday.date.toISOString().slice(0, 10),
    endDate: holiday.date.toISOString().slice(0, 10),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: geo,
      address: {
        "@type": "PostalAddress",
        addressCountry: "CA",
        addressRegion: province.replace("CA-", ""),
      },
    },
  }));

  const faq = [
    {
      question: isFr
        ? `Combien y a-t-il de jours fériés en ${geo} en ${year} ?`
        : `How many statutory holidays does ${geo} observe in ${year}?`,
      answer: isFr
        ? `${geo} observe ${holidays.length} jours fériés statutaires en ${year}.`
        : `${geo} observes ${holidays.length} statutory holidays in ${year}.`,
    },
    {
      question: isFr
        ? "Comment ajouter ces jours fériés à mon calendrier ?"
        : "How can I add these holidays to my calendar?",
      answer: isFr
        ? "Téléchargez ou abonnez-vous au flux iCalendar (.ics) ci-dessus pour les importer dans Google Calendar, Apple Calendar, Outlook ou tout autre outil compatible iCal."
        : "Download or subscribe to the .ics feed above to import them into Google Calendar, Apple Calendar, Outlook, or any iCal-compatible tool.",
    },
    {
      question: isFr
        ? "Quels jours fériés sont propres à cette province ?"
        : "Which holidays are specific to this province?",
      answer: isFr
        ? "Les jours fériés non globaux dans la liste ci-dessous sont propres à cette province ou aux territoires/provinces associés."
        : "Holidays in the list below that are not marked national are specific to this province or to the territories that observe them.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  faqJsonLd.speakable = {
    "@type": "SpeakableSpecification",
    cssSelector: [".hero h1", ".heroLead", ".faqEntry h3"],
  };

  const lastModified = await getSitemapLastmod(locale, `/statutory-holidays/${slug}/${year}`);
  const webPageJsonLd = buildWebPageJsonLd({
    locale,
    name: isFr ? `Jours fériés ${geo} ${year}` : `${geo} ${year} statutory holidays`,
    description: isFr
      ? `${geo} observe ${holidays.length} jours fériés statutaires en ${year}.`
      : `${geo} observes ${holidays.length} statutory holidays in ${year}.`,
    url: `https://whatweek.ca/${locale}/statutory-holidays/${slug}/${year}`,
    dateModified: lastModified,
    isSpeakable: true,
  });

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, faqJsonLd, ...eventsJsonLd, webPageJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />

      <SiteHeader locale={locale} year={year} province={province} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {year}
          </Link>
          <span> / </span>
          <span>{geo}</span>
        </nav>
        <h1>
          {isFr ? `Jours fériés ${year} — ${geo}` : `${year} statutory holidays in ${geo}`}
        </h1>
        <p className="subtle heroLead">
          {isFr
            ? `${holidays.length} jours fériés statutaires en ${geo} pour ${year}. Cliquez sur un nom pour voir la semaine, ou abonnez-vous au flux iCalendar.`
            : `${holidays.length} statutory holidays in ${geo} for ${year}. Click any holiday to see its week, or subscribe to the iCalendar feed.`}
        </p>
        <div className="ctaRow">
          <a className="ctaPrimary" href={icsHref} download>
            {isFr ? "Télécharger .ics" : "Download .ics"}
          </a>
          <a className="ctaSecondary" href={`webcal://whatweek.ca${icsHref}`}>
            {isFr ? "S’abonner (webcal)" : "Subscribe (webcal)"}
          </a>
        </div>
      </section>

      <section className="panel">
        <h2>{isFr ? "Liste des jours fériés" : "Holiday list"}</h2>
        {holidays.length === 0 ? (
          <p>{isFr ? "Aucune donnée disponible." : "No data available."}</p>
        ) : (
          <table className="holidayTable">
            <thead>
              <tr>
                <th>{isFr ? "Date" : "Date"}</th>
                <th>{isFr ? "Jour" : "Weekday"}</th>
                <th>{isFr ? "Nom" : "Name"}</th>
                <th>{isFr ? "Sem." : "Wk"}</th>
                <th>{isFr ? "Portée" : "Scope"}</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => {
                const weekday = new Intl.DateTimeFormat(localeCode, {
                  weekday: "long",
                  timeZone: "UTC",
                }).format(holiday.date);
                const isoWeek = getIsoWeekNumber(holiday.date);
                const dateLabel = formatDateLong(holiday.date, localeCode);
                return (
                  <tr key={`${holiday.nameEn}-${holiday.date.toISOString()}`}>
                    <td>{dateLabel}</td>
                    <td>{weekday}</td>
                    <td>
                      <strong>{isFr ? holiday.nameFr : holiday.nameEn}</strong>
                    </td>
                    <td>
                      <Link href={`/${locale}/week/${holiday.date.getUTCFullYear()}/${isoWeek}`} prefetch={false}>
                        W{isoWeek}
                      </Link>
                    </td>
                    <td className="subtle">
                      {holiday.global
                        ? isFr
                          ? "National"
                          : "National"
                        : isFr
                          ? "Provincial"
                          : "Provincial"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {longWeekends.length > 0 && (
        <section className="panel">
          <h2>{isFr ? `Longs week-ends en ${year}` : `${year} long weekends`}</h2>
          <ul className="longWeekendList">
            {longWeekends.map((weekend) => (
              <li key={weekend.start.toISOString()}>
                <strong>{isFr ? weekend.labelFr : weekend.labelEn}</strong>
                <span className="subtle">
                  {" — "}
                  {formatDateLong(weekend.start, localeCode)} → {formatDateLong(weekend.end, localeCode)}
                </span>
              </li>
            ))}
          </ul>
          <p>
            <Link href={`/${locale}/long-weekends/${year}`} prefetch={false}>
              {isFr ? `Voir tous les longs week-ends ${year} →` : `See all ${year} long weekends →`}
            </Link>
          </p>
        </section>
      )}

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
        <h2>{isFr ? "Autres provinces" : "Other provinces"}</h2>
        <div className="linkGrid">
          {provinceCodes
            .filter((code) => code !== province)
            .map((code) => (
              <Link
                key={code}
                href={`/${locale}/statutory-holidays/${provinceShortCode(code)}/${year}`}
                prefetch={false}
              >
                {provinceNames[code][locale]}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
