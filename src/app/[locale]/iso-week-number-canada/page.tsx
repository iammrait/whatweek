import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { isoWeekCanadaDescription, isoWeekCanadaTitle } from "@/lib/seo-metadata";
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "fr" ? "Accueil" : "Home",
        item: `https://whatweek.ca/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "fr" ? "Semaine ISO" : "ISO week",
        item: canonical,
      },
    ],
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
