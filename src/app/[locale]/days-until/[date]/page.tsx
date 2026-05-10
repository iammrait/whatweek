import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DaysCalculator } from "@/components/DaysCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd } from "@/lib/seo-metadata";
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

type Props = {
  params: Promise<{ locale: string; date: string }>;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const seen = new Set<string>();
  const dates: string[] = [];

  // Next 365 days for high-volume "days until <date>" queries.
  for (let i = 1; i <= 365; i += 1) {
    const next = new Date(today);
    next.setUTCDate(today.getUTCDate() + i);
    const slug = ymd(next);
    if (!seen.has(slug)) {
      seen.add(slug);
      dates.push(slug);
    }
  }

  // Popular Canadian targets (this year and next year occurrences).
  for (const entry of popularCanadianDates) {
    const next = resolvePopularDate(entry, today);
    const slug = ymd(next);
    if (!seen.has(slug)) {
      seen.add(slug);
      dates.push(slug);
    }
    const yearAfter = new Date(next);
    yearAfter.setUTCFullYear(next.getUTCFullYear() + 1);
    const slug2 = ymd(yearAfter);
    if (!seen.has(slug2)) {
      seen.add(slug2);
      dates.push(slug2);
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
  const human = formatLong(target, locale);

  let title: string;
  let description: string;
  if (days >= 0) {
    title = isFr
      ? `Combien de jours jusqu'au ${human} ? ${days} jours`
      : `How many days until ${human}? ${days} days`;
    description = isFr
      ? `Il reste ${days} jours jusqu'au ${human}. Compteur en direct selon un fuseau horaire canadien, avec semaine ISO et contexte férié.`
      : `${days} days until ${human}. Live countdown using a Canadian time zone, with ISO week number and holiday context.`;
  } else {
    title = isFr
      ? `Le ${human} est passé — il y a ${Math.abs(days)} jours`
      : `${human} was ${Math.abs(days)} days ago`;
    description = isFr
      ? `Le ${human} est passé depuis ${Math.abs(days)} jours. Vérifiez la semaine ISO, le jour de l'année et plus.`
      : `${human} was ${Math.abs(days)} days ago. Check the ISO week number, day of the year, and related context.`;
  }
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  const canonical = `https://whatweek.ca/${locale}/days-until/${date}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-CA": `https://whatweek.ca/en/days-until/${date}`,
        "fr-CA": `https://whatweek.ca/fr/days-until/${date}`,
        "x-default": `https://whatweek.ca/en/days-until/${date}`,
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

export default async function DaysUntilDatePage({ params }: Props) {
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
  const targetIso = ymd(target);
  const todayIso = ymd(today);
  const targetLong = formatLong(target, locale);
  const isoWeek = getIsoWeekNumber(target);
  const weekday = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { weekday: "long", timeZone: "UTC" }).format(target);

  const faq = [
    {
      question: isFr ? `Combien de jours jusqu'au ${targetLong} ?` : `How many days until ${targetLong}?`,
      answer: days >= 0
        ? (isFr ? `Il reste ${days} jours jusqu'au ${targetLong} (${weekday}).` : `There are ${days} days until ${targetLong} (${weekday}).`)
        : (isFr ? `Le ${targetLong} est passé depuis ${absDays} jours.` : `${targetLong} was ${absDays} days ago.`),
    },
    {
      question: isFr ? "Comment ce nombre est-il calculé ?" : "How is this number calculated?",
      answer: isFr
        ? "On compare la date cible avec la date d'aujourd'hui en fuseau horaire canadien, puis on retourne la différence en jours entiers."
        : "We compare the target date with today's date in a Canadian time zone, then return the difference in whole days.",
    },
    {
      question: isFr ? "Dans quelle semaine ISO tombe cette date ?" : "Which ISO week does this date fall in?",
      answer: isFr
        ? `Le ${targetLong} fait partie de la semaine ISO ${isoWeek} de ${year}.`
        : `${targetLong} is in ISO week ${isoWeek} of ${year}.`,
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
          <Link href={`/${locale}/days-until`} prefetch={false}>{isFr ? "Jours jusqu'à" : "Days until"}</Link>
          <span> / </span>
          <span>{date}</span>
        </nav>
        <h1>
          {days >= 0
            ? (isFr ? `${days} jours jusqu'au ${targetLong}` : `${days} days until ${targetLong}`)
            : (isFr ? `${absDays} jours depuis le ${targetLong}` : `${absDays} days since ${targetLong}`)}
        </h1>
        <div className="keywordHero" style={{ marginTop: "1.25rem" }}>
          <div className="keywordHeroMetric">{absDays}</div>
          <div className="keywordHeroLabel">
            {days > 0
              ? (isFr ? "jours restants" : "days remaining")
              : days === 0
                ? (isFr ? "c'est aujourd'hui !" : "that's today!")
                : (isFr ? "jours écoulés" : "days ago")}
          </div>
          <div className="keywordHeroSubtext">
            {weekday} · {isFr ? "Semaine ISO" : "ISO week"} {isoWeek}, {year}
          </div>
        </div>
      </section>

      <section className="panel">
        <DaysCalculator locale={locale} defaultStart={todayIso} defaultEnd={targetIso} defaultMode="until" />
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
          <Link href={`/${locale}/weeks-until/${date}`} prefetch={false}>
            {isFr ? "Semaines jusqu'à cette date" : "Weeks until this date"}
          </Link>
          <Link href={`/${locale}/week/${year}/${isoWeek}`} prefetch={false}>
            {isFr ? `Semaine ${isoWeek} ${year}` : `Week ${isoWeek}, ${year}`}
          </Link>
          <Link href={`/${locale}/calendar/${year}`} prefetch={false}>
            {isFr ? `Calendrier ${year}` : `${year} calendar`}
          </Link>
          <Link href={`/${locale}/days-until`} prefetch={false}>
            {isFr ? "Toutes les dates" : "All dates"}
          </Link>
        </div>
      </section>
    </main>
  );
}
