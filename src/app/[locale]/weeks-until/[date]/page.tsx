import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WeeksCalculator } from "@/components/WeeksCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo-metadata";
import { getIsoWeekNumber, getTodayInTimeZone } from "@/lib/week";
import {
  diffInDays,
  formatLong,
  isDateSlug,
  parseIsoDate,
  popularCanadianDates,
  resolvePopularDate,
  ymd,
} from "@/lib/date-math";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

type Props = { params: Promise<{ locale: string; date: string }> };

export const dynamic = "force-static";

export function generateStaticParams() {
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const seen = new Set<string>();
  const dates: string[] = [];
  for (let i = 1; i <= 365; i += 1) {
    const next = new Date(today);
    next.setUTCDate(today.getUTCDate() + i);
    const slug = ymd(next);
    if (!seen.has(slug)) {
      seen.add(slug);
      dates.push(slug);
    }
  }
  for (const entry of popularCanadianDates) {
    const next = resolvePopularDate(entry, today);
    const slug = ymd(next);
    if (!seen.has(slug)) {
      seen.add(slug);
      dates.push(slug);
    }
  }
  return locales.flatMap((locale) => dates.map((date) => ({ locale, date })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date } = await params;
  if (!isLocale(locale) || !isDateSlug(date)) return {};
  const target = parseIsoDate(date);
  if (!target) return {};
  const year = target.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) return {};
  const isFr = locale === "fr";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const days = diffInDays(target, today);
  const fullWeeks = Math.floor(Math.abs(days) / 7);
  const human = formatLong(target, locale);

  const title = days >= 0
    ? (isFr ? `Combien de semaines jusqu'au ${human} ? ${fullWeeks} sem.` : `How many weeks until ${human}? ${fullWeeks} weeks`)
    : (isFr ? `Le ${human} est passé — il y a ${fullWeeks} semaines` : `${human} was ${fullWeeks} weeks ago`);
  const description = days >= 0
    ? (isFr
        ? `Il reste ${fullWeeks} semaines complètes jusqu'au ${human}. Compteur en direct, semaine ISO et contexte calendrier.`
        : `${fullWeeks} full weeks until ${human}. Live countdown, ISO week, and calendar context.`)
    : (isFr
        ? `Le ${human} est passé depuis ${fullWeeks} semaines. Vérifiez le contexte semaine ISO et calendrier.`
        : `${human} was ${fullWeeks} weeks ago. Check the ISO week and calendar context.`);

  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  const canonical = `https://whatweek.ca/${locale}/weeks-until/${date}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/weeks-until/${date}`,
        "fr-CA": `https://whatweek.ca/fr/weeks-until/${date}`,
        "x-default": `https://whatweek.ca/en/weeks-until/${date}`,
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
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function WeeksUntilDatePage({ params }: Props) {
  const { locale: localeInput, date } = await params;
  if (!isLocale(localeInput)) notFound();
  if (!isDateSlug(date)) notFound();
  const target = parseIsoDate(date);
  if (!target) notFound();
  const year = target.getUTCFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const days = diffInDays(target, today);
  const absDays = Math.abs(days);
  const fullWeeks = Math.floor(absDays / 7);
  const remainder = absDays % 7;
  const exactWeeks = (absDays / 7).toFixed(2);
  const targetIso = ymd(target);
  const todayIso = ymd(today);
  const targetLong = formatLong(target, locale);
  const isoWeek = getIsoWeekNumber(target);

  const faq = [
    {
      question: isFr ? `Combien de semaines jusqu'au ${targetLong} ?` : `How many weeks until ${targetLong}?`,
      answer: days >= 0
        ? (isFr ? `Il reste ${fullWeeks} semaines et ${remainder} jours jusqu'au ${targetLong} (semaine ISO ${isoWeek}).` : `There are ${fullWeeks} weeks and ${remainder} days until ${targetLong} (ISO week ${isoWeek}).`)
        : (isFr ? `Le ${targetLong} est passé depuis ${fullWeeks} semaines et ${remainder} jours.` : `${targetLong} was ${fullWeeks} weeks and ${remainder} days ago.`),
    },
    {
      question: isFr ? "Combien cela représente en jours ?" : "How many days is that?",
      answer: isFr ? `${absDays} jours.` : `${absDays} days.`,
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Semaines jusqu'à" : "Weeks until", path: "/weeks-until" },
    { name: date, path: `/weeks-until/${date}` },
  ]);
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [breadcrumbJsonLd, faqJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={year} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <Link href={`/${locale}/weeks-until`} prefetch={false}>{isFr ? "Semaines jusqu'à" : "Weeks until"}</Link>
          <span> / </span>
          <span>{date}</span>
        </nav>
        <h1>
          {days >= 0
            ? (isFr ? `${fullWeeks} semaines jusqu'au ${targetLong}` : `${fullWeeks} weeks until ${targetLong}`)
            : (isFr ? `${fullWeeks} semaines depuis le ${targetLong}` : `${fullWeeks} weeks since ${targetLong}`)}
        </h1>
        <div className="keywordHero" style={{ marginTop: "1.25rem" }}>
          <div className="keywordHeroMetric">{exactWeeks}</div>
          <div className="keywordHeroLabel">
            {days > 0 ? (isFr ? "semaines exactes restantes" : "exact weeks remaining") : isFr ? "semaines exactes écoulées" : "exact weeks ago"}
          </div>
          <div className="keywordHeroSubtext">
            {fullWeeks} {isFr ? "sem." : "weeks"} {remainder > 0 ? `+ ${remainder} ${isFr ? "j." : "days"}` : ""} · {isFr ? "Semaine ISO" : "ISO week"} {isoWeek}, {year}
          </div>
        </div>
      </section>

      <section className="panel">
        <WeeksCalculator locale={locale} defaultStart={todayIso} defaultEnd={targetIso} defaultMode="until" />
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
        <h2>{isFr ? "Voir aussi" : "See also"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/days-until/${date}`} prefetch={false}>
            {isFr ? "Jours jusqu'à cette date" : "Days until this date"}
          </Link>
          <Link href={`/${locale}/week/${year}/${isoWeek}`} prefetch={false}>
            {isFr ? `Semaine ${isoWeek} ${year}` : `Week ${isoWeek}, ${year}`}
          </Link>
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {isFr ? `Calendrier ${year}` : `${year} calendar`}
          </Link>
          <Link href={`/${locale}/weeks-until`} prefetch={false}>
            {isFr ? "Toutes les dates" : "All dates"}
          </Link>
        </div>
      </section>
    </main>
  );
}
