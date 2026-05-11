import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getLongWeekendsForYear } from "@/lib/holidays-ca";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { isProvinceCode, provinceCodes, provinceNames, type ProvinceCode } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo-metadata";
import { formatDateLong, getIsoWeekNumber } from "@/lib/week";

// Pre-render an extended window so 2024–2030 (and a few years either side)
// always have static long-weekend pages — competitors rank multiple years.
const MIN_YEAR = Math.min(2024, new Date().getUTCFullYear() - 2);
const MAX_YEAR = Math.max(2030, new Date().getUTCFullYear() + 4);

type Props = {
  params: Promise<{ locale: string; year: string }>;
  searchParams: Promise<{ province?: string }>;
};

function parseYear(input: string): number | null {
  const value = Number(input);
  if (!Number.isInteger(value) || value < MIN_YEAR || value > MAX_YEAR) return null;
  return value;
}

function parseProvinceQuery(input: string | undefined): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
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
  const title = isFr
    ? `Longs week-ends ${year} au Canada`
    : `Long weekends in Canada ${year}`;
  const description = isFr
    ? `Tous les longs week-ends ${year} au Canada — dates exactes, jour férié à l’origine et numéro de semaine ISO.`
    : `Every Canadian long weekend in ${year} with exact dates, the underlying statutory holiday, and the ISO week number.`;
  const canonical = `https://whatweek.ca/${locale}/long-weekends/${year}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    keywords: isFr
      ? [`longs week-ends ${year}`, `ponts ${year}`, `vacances canada ${year}`, `week-ends prolongés`, `planifier vacances`]
      : [`long weekends ${year}`, `holiday weekends ${year}`, `canada vacation ${year}`, `extended weekends`, `trip planning`],
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/long-weekends/${year}`,
        "fr-CA": `https://whatweek.ca/fr/long-weekends/${year}`,
        "x-default": `https://whatweek.ca/en/long-weekends/${year}`,
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

export default async function LongWeekendsPage({ params, searchParams }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const year = parseYear(yearInput);
  if (!year) notFound();
  const locale: Locale = localeInput;
  const query = await searchParams;
  const province = parseProvinceQuery(query.province);
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const geo = province ? provinceNames[province][locale] : isFr ? "Canada (fédéral)" : "Canada (federal)";
  const longWeekends = await getLongWeekendsForYear(year, province);

  const today = new Date();
  const upcoming = longWeekends.filter((weekend) => weekend.end.getTime() >= today.getTime());
  const past = longWeekends.filter((weekend) => weekend.end.getTime() < today.getTime());

  const faq = [
    {
      question: isFr
        ? `Combien de longs week-ends y a-t-il en ${year} ?`
        : `How many long weekends are there in ${year}?`,
      answer: isFr
        ? `${geo} compte ${longWeekends.length} longs week-ends en ${year}.`
        : `${geo} has ${longWeekends.length} long weekends in ${year}.`,
    },
    {
      question: isFr
        ? "Comment définissez-vous un long week-end ?"
        : "How do you define a long weekend?",
      answer: isFr
        ? "Un long week-end est un jour férié statutaire qui tombe un lundi (du samedi au lundi) ou un vendredi (du vendredi au dimanche)."
        : "A long weekend is a statutory holiday that lands on a Monday (Sat–Mon) or a Friday (Fri–Sun).",
    },
    {
      question: isFr
        ? "Les longs week-ends varient-ils selon la province ?"
        : "Do long weekends vary by province?",
      answer: isFr
        ? "Oui—certains jours fériés sont propres à une province (par ex. Family Day, Civic Holiday). Choisissez votre province ci-dessous pour adapter la liste."
        : "Yes—some holidays are province-specific (Family Day, Civic Holiday, etc.). Pick your province below to tailor the list.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isFr ? `Longs week-ends ${year}` : `${year} long weekends`,
    itemListElement: longWeekends.map((weekend, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: isFr ? weekend.labelFr : weekend.labelEn,
      startDate: weekend.start.toISOString().slice(0, 10),
      endDate: weekend.end.toISOString().slice(0, 10),
    })),
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [buildBreadcrumbJsonLd(locale, [{ name: isFr ? `Longs week-ends ${year}` : `${year} long weekends`, path: `/long-weekends/${year}` }]), faqJsonLd, itemListJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const renderRow = (weekend: (typeof longWeekends)[number]) => {
    const isoWeek = getIsoWeekNumber(weekend.start);
    return (
      <li key={weekend.start.toISOString()} className="longWeekendRow">
        <div>
          <strong>{isFr ? weekend.labelFr : weekend.labelEn}</strong>
          <p className="subtle">
            {formatDateLong(weekend.start, localeCode)} → {formatDateLong(weekend.end, localeCode)}
          </p>
        </div>
        <Link href={`/${locale}/week/${weekend.start.getUTCFullYear()}/${isoWeek}`} prefetch={false}>
          {isFr ? `Semaine ${isoWeek}` : `Week ${isoWeek}`}
        </Link>
      </li>
    );
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={year} province={province} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{isFr ? `Longs week-ends ${year}` : `${year} long weekends`}</span>
        </nav>
        <h1>
          {isFr ? `Longs week-ends ${year}` : `${year} long weekends`}{" "}
          <span className="subtle">— {geo}</span>
        </h1>
        <p className="subtle heroLead">
          {isFr
            ? `${longWeekends.length} longs week-ends prévus en ${year}. Cliquez sur une semaine pour voir les détails.`
            : `${longWeekends.length} long weekends scheduled in ${year}. Click any week to see its calendar detail.`}
        </p>

        <nav className="yearNav" aria-label={isFr ? "Navigation année" : "Year navigation"}>
          <Link href={`/${locale}/long-weekends/${year - 1}`} prefetch={false}>
            {year - 1}
          </Link>
          <span className="current">{year}</span>
          <Link href={`/${locale}/long-weekends/${year + 1}`} prefetch={false}>
            {year + 1}
          </Link>
        </nav>
      </section>

      {upcoming.length > 0 && (
        <section className="panel">
          <h2>{isFr ? "À venir" : "Upcoming"}</h2>
          <ul className="longWeekendList">{upcoming.map(renderRow)}</ul>
        </section>
      )}

      {past.length > 0 && (
        <section className="panel">
          <h2>{isFr ? "Passés" : "Past"}</h2>
          <ul className="longWeekendList">{past.map(renderRow)}</ul>
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
        <h2>{isFr ? "Choisir une province" : "Pick a province"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/long-weekends/${year}`} prefetch={false}>
            {isFr ? "Tout le Canada" : "All Canada"}
          </Link>
          {provinceCodes.map((code) => (
            <Link
              key={code}
              href={`/${locale}/long-weekends/${year}?province=${code.replace("CA-", "").toLowerCase()}`}
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
