import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
  isoWeekCanadaDescription,
  isoWeekCanadaTitle,
} from "@/lib/seo-metadata";
import { getSitemapLastmod } from "@/lib/sitemap-lastmod";
import { formatDateLong, getIsoWeekNumber, getTodayInTimeZone, startOfIsoWeek } from "@/lib/week";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const canonical = `https://whatweek.ca/${locale}/iso-week-number-canada`;
  const enPath = "https://whatweek.ca/en/iso-week-number-canada";
  const frPath = "https://whatweek.ca/fr/iso-week-number-canada";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  const title = isoWeekCanadaTitle(locale);
  const description = isoWeekCanadaDescription(locale);

  return {
    title,
    description,
    keywords: isFr
      ? ["numéro de semaine iso canada", "semaine iso 8601", "calendrier iso", "numéro de semaine international", "standard iso semaine"]
      : ["iso week number canada", "iso 8601 week", "iso calendar", "international week number", "iso week standard"],
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

export default async function IsoWeekNumberCanadaPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const week = getIsoWeekNumber(today);
  const start = startOfIsoWeek(today);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  const canonical = `https://whatweek.ca/${locale}/iso-week-number-canada`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: locale === "fr" ? "Semaine ISO" : "ISO week", path: "/iso-week-number-canada" },
  ]);
  const lastModified = await getSitemapLastmod(locale, "/iso-week-number-canada");
  const webPageJsonLd = buildWebPageJsonLd({
    locale,
    name: locale === "fr" ? "Numéro de semaine ISO au Canada" : "ISO Week Number in Canada",
    description: locale === "fr"
      ? "Consultez la semaine ISO 8601 en cours au Canada."
      : "Check the current ISO 8601 week number in Canada.",
    url: canonical,
    dateModified: lastModified,
    isSpeakable: true,
  });

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name:
          locale === "fr"
            ? "Qu’est-ce que le numéro de semaine ISO 8601 au Canada ?"
            : "What is the ISO 8601 week number in Canada?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? `La norme ISO 8601 numérote les semaines du lundi au dimanche. Aujourd’hui, la semaine ISO en cours est la semaine ${week} du ${formatDateLong(start, localeCode, defaultCanadaTimeZone)} au ${formatDateLong(end, localeCode, defaultCanadaTimeZone)}.`
              : `ISO 8601 numbers weeks from Monday through Sunday. Right now the current ISO week is week ${week}, from ${formatDateLong(start, localeCode, defaultCanadaTimeZone)} through ${formatDateLong(end, localeCode, defaultCanadaTimeZone)}.`,
        },
      },
      {
        "@type": "Question",
        name:
          locale === "fr"
            ? "Quand la semaine ISO commence-t-elle et finit-elle ?"
            : "When does an ISO week start and end?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? "Chaque semaine ISO commence le lundi à minuit (selon le calendrier utilisé ici en UTC pour les dates affichées) et se termine le dimanche. C’est le repère utilisé par beaucoup de systèmes internationaux et de logiciels."
              : "Each ISO week begins on Monday (dates here use UTC for the displayed calendar boundaries) and ends on Sunday. This is the convention used by many international systems and software libraries.",
        },
      },
      {
        "@type": "Question",
        name:
          locale === "fr"
            ? "Pourquoi la semaine ISO 1 peut-elle se trouver en janvier ou en décembre ?"
            : "Why can ISO week 1 fall in January or December?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "fr"
              ? "L’année de semaine ISO est centrée sur le jeudi : la semaine qui contient le premier jeudi de janvier est la semaine 1. Des semaines en bord d’année civile peuvent donc appartenir à une autre année ISO que l’année du calendrier."
              : "ISO week-year is anchored around Thursdays: the week containing the first Thursday of January is week 1. Week-long ranges at calendar year boundaries can therefore belong to a different ISO week-year than the civil year label.",
        },
      },
    ],
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, webPageJsonLd, faqJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />
      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "fr" ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{locale === "fr" ? "Semaine ISO" : "ISO week"}</span>
        </nav>
        <h1>{locale === "fr" ? "Numéro de semaine ISO au Canada" : "ISO Week Number in Canada"}</h1>
        <p className="subtle" style={{ maxWidth: "800px", margin: "0 auto 1rem", lineHeight: 1.6 }}>
          {locale === "fr"
            ? "La norme ISO 8601 définit des semaines du lundi au dimanche et un calendrier de semaines qui peut chevaucher deux années civiles. Cette page résume la semaine ISO en cours au Canada avec les dates de début et de fin, pour la planification, la paie et le travail avec des systèmes internationaux."
            : "ISO 8601 defines Monday–Sunday weeks and a week-number calendar that can span two calendar years. This page shows the current ISO week in Canada with start and end dates—helpful for planning, payroll, and working with international systems."}
        </p>
        <p className="currentWeek">
          ISO {locale === "fr" ? "Semaine" : "Week"}: <strong>{week}</strong>
        </p>
        <p className="subtle">
          {formatDateLong(start, localeCode, defaultCanadaTimeZone)} - {formatDateLong(end, localeCode, defaultCanadaTimeZone)}
        </p>
        <p>
          <Link href={`/${locale}`}>{locale === "fr" ? "Retour au calendrier" : "Back to calendar"}</Link>
        </p>
      </section>
      <section className="panel quickLinks">
        <h2>{locale === "fr" ? "Outils de semaine liés" : "Related week tools"}</h2>
        <div className="linkGrid">
          <Link href={`/${locale}/current-week-number-canada`} prefetch={false}>
            {locale === "fr" ? "Semaine actuelle au Canada" : "Current week number in Canada"}
          </Link>
          <Link href={`/${locale}/what-week-of-the-year-is-it`} prefetch={false}>
            {locale === "fr" ? "Quelle semaine de l'année?" : "What week of the year is it?"}
          </Link>
          <Link href={`/${locale}/week-by-year`} prefetch={false}>
            {locale === "fr" ? "Semaine par année" : "Week by year"}
          </Link>
          <Link href={`/${locale}/calendar/${new Date().getUTCFullYear()}`} prefetch={false}>
            {locale === "fr" ? "Calendrier de cette année" : "This year calendar"}
          </Link>
        </div>
      </section>
    </main>
  );
}
