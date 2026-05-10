import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { buildFaqJsonLd } from "@/lib/seo-metadata";
import { formatDateLong, getIsoWeekNumber } from "@/lib/week";
import {
  getSchoolYearPlan,
  isSchoolProvinceCode,
  schoolProvinces,
  type SchoolProvinceCode,
} from "@/lib/school-year-ca";

const NOW_YEAR = new Date().getUTCFullYear();
const MIN_YEAR = NOW_YEAR - 2;
const MAX_YEAR = NOW_YEAR + 3;

type Props = { params: Promise<{ locale: string; province: string; startYear: string }> };

function parseStartYear(input: string): number | null {
  const v = Number(input);
  if (!Number.isInteger(v) || v < MIN_YEAR || v > MAX_YEAR) return null;
  return v;
}

export function generateStaticParams() {
  const years: number[] = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y += 1) years.push(y);
  return locales.flatMap((locale) =>
    schoolProvinces.flatMap((p) =>
      years.map((year) => ({ locale, province: p.code, startYear: String(year) })),
    ),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, province, startYear } = await params;
  if (!isLocale(locale)) return {};
  if (!isSchoolProvinceCode(province)) return {};
  const start = parseStartYear(startYear);
  if (!start) return {};
  const provInfo = schoolProvinces.find((p) => p.code === province)!;
  const isFr = locale === "fr";
  const provName = isFr ? provInfo.nameFr : provInfo.nameEn;
  const title = isFr
    ? `Calendrier scolaire ${provName} ${start}-${start + 1}`
    : `${provName} ${start}–${start + 1} School Year Calendar`;
  const description = isFr
    ? `Calendrier scolaire ${provName} ${start}-${start + 1} : rentrée, étapes, relâche et fêtes — avec les semaines ISO 8601 affichées sur chaque date.`
    : `${provName} ${start}–${start + 1} school calendar: first day, terms, breaks, and holidays — with ISO 8601 week numbers next to each date.`;
  const canonical = `https://whatweek.ca/${locale}/school-year/${province}/${start}`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/school-year/${province}/${start}`,
        "fr-CA": `https://whatweek.ca/fr/school-year/${province}/${start}`,
        "x-default": `https://whatweek.ca/en/school-year/${province}/${start}`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function SchoolYearPage({ params }: Props) {
  const { locale: localeInput, province: provinceInput, startYear: yearInput } = await params;
  if (!isLocale(localeInput)) notFound();
  if (!isSchoolProvinceCode(provinceInput)) notFound();
  const start = parseStartYear(yearInput);
  if (!start) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const province = provinceInput as SchoolProvinceCode;
  const provInfo = schoolProvinces.find((p) => p.code === province)!;
  const provName = isFr ? provInfo.nameFr : provInfo.nameEn;

  const plan = getSchoolYearPlan(province, start, locale);

  const faq = [
    {
      question: isFr ? "Quand commence l'année scolaire ?" : "When does the school year start?",
      answer: isFr
        ? `Pour ${provName}, la rentrée typique tombe le ${formatDateLong(plan.firstDay, localeCode)} (semaine ISO ${getIsoWeekNumber(plan.firstDay)}).`
        : `For ${provName}, the typical first day is ${formatDateLong(plan.firstDay, localeCode)} (ISO week ${getIsoWeekNumber(plan.firstDay)}).`,
    },
    {
      question: isFr ? "Ces dates sont-elles officielles ?" : "Are these the official dates?",
      answer: isFr
        ? "Les dates sont basées sur les calendriers types des grands conseils scolaires. Vérifiez toujours auprès de votre école ou conseil scolaire local pour les dates officielles."
        : "Dates are based on the typical calendars of major school boards. Always confirm with your local school or board for the official dates.",
    },
    {
      question: isFr ? "La relâche est-elle la même partout ?" : "Is March/spring break the same everywhere?",
      answer: isFr
        ? "Non. La relâche varie selon la province et même selon le conseil scolaire. Cette page indique la fenêtre la plus courante."
        : "No. The break varies by province and sometimes by board. This page lists the most common window.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  const renderRow = (entry: { labelEn: string; labelFr: string; start: Date; end: Date }) => {
    const sameDay = entry.start.getTime() === entry.end.getTime();
    return (
      <li key={`${entry.labelEn}-${entry.start.toISOString()}`} className="longWeekendRow">
        <div>
          <strong>{isFr ? entry.labelFr : entry.labelEn}</strong>
          <p className="subtle">
            {sameDay
              ? formatDateLong(entry.start, localeCode)
              : `${formatDateLong(entry.start, localeCode)} → ${formatDateLong(entry.end, localeCode)}`}
          </p>
        </div>
        <span>
          {isFr ? "Semaine" : "Week"} {getIsoWeekNumber(entry.start)}
          {!sameDay && getIsoWeekNumber(entry.start) !== getIsoWeekNumber(entry.end) && `–${getIsoWeekNumber(entry.end)}`}
        </span>
      </li>
    );
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(faqJsonLd) }} />
      <SiteHeader locale={locale} year={start} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Calendrier scolaire" : "School year"}</span>
        </nav>
        <h1>
          {isFr ? `Calendrier scolaire ${provName} ${start}-${start + 1}` : `${provName} ${start}–${start + 1} School Year`}
        </h1>
        <p className="subtle heroLead">
          {isFr
            ? `Rentrée le ${formatDateLong(plan.firstDay, localeCode)} (semaine ISO ${getIsoWeekNumber(plan.firstDay)}). Fin le ${formatDateLong(plan.lastDay, localeCode)} (semaine ISO ${getIsoWeekNumber(plan.lastDay)}).`
            : `First day: ${formatDateLong(plan.firstDay, localeCode)} (ISO week ${getIsoWeekNumber(plan.firstDay)}). Last day: ${formatDateLong(plan.lastDay, localeCode)} (ISO week ${getIsoWeekNumber(plan.lastDay)}).`}
        </p>
        <p className="subtle">
          {isFr
            ? "Dates indicatives basées sur les calendriers types des principaux conseils scolaires. Vérifiez auprès de votre école pour les dates officielles."
            : "Indicative dates based on typical major-board calendars. Confirm with your school for the official ones."}
        </p>
        <nav className="yearNav" aria-label={isFr ? "Année scolaire" : "School year"}>
          <Link href={`/${locale}/school-year/${province}/${start - 1}`} prefetch={false}>{start - 1}–{start}</Link>
          <span className="current">{start}–{start + 1}</span>
          <Link href={`/${locale}/school-year/${province}/${start + 1}`} prefetch={false}>{start + 1}–{start + 2}</Link>
        </nav>
      </section>

      <section className="panel">
        <h2>{isFr ? "Étapes / trimestres" : "Terms"}</h2>
        <ul className="longWeekendList">{plan.terms.map(renderRow)}</ul>
      </section>

      <section className="panel">
        <h2>{isFr ? "Pauses et fêtes" : "Breaks and holidays"}</h2>
        <ul className="longWeekendList">{plan.breaks.map(renderRow)}</ul>
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
        <h2>{isFr ? "Choisir une province" : "Pick a province"}</h2>
        <div className="linkGrid">
          {schoolProvinces.map((p) => (
            <Link key={p.code} href={`/${locale}/school-year/${p.code}/${start}`} prefetch={false}>
              {isFr ? p.nameFr : p.nameEn}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Outils liés" : "Related tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/calendar/${start}`} prefetch={false}>{isFr ? `Calendrier ${start}` : `${start} calendar`}</Link>
          <Link href={`/${locale}/calendar/${start + 1}`} prefetch={false}>{isFr ? `Calendrier ${start + 1}` : `${start + 1} calendar`}</Link>
          <Link href={`/${locale}/long-weekends/${start}`} prefetch={false}>{isFr ? `Longs week-ends ${start}` : `${start} long weekends`}</Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>{isFr ? "Jours ouvrables" : "Business days"}</Link>
        </div>
      </section>
    </main>
  );
}
