import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { formatDateLong, getCanadaWeekNumber, getIsoWeekNumber, getTodayInTimeZone, startOfCanadaWeek, startOfIsoWeek } from "@/lib/week";

import { getSeoOverride } from "@/lib/seo-overrides";
import { currentWeekCanadaDescription, currentWeekCanadaTitle } from "@/lib/seo-metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const canonical = `https://whatweek.ca/${locale}/current-week-number-canada`;
  const enPath = "https://whatweek.ca/en/current-week-number-canada";
  const frPath = "https://whatweek.ca/fr/current-week-number-canada";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  
  const path = `/${locale}/current-week-number-canada`;
  const override = getSeoOverride(path);
  
  const builtTitle = currentWeekCanadaTitle(locale);
  const builtDescription = currentWeekCanadaDescription(locale);
  const title = override?.title ?? builtTitle;
  const description = override?.description ?? builtDescription;

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

export default async function CurrentWeekNumberCanadaPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) return null;
  const locale: Locale = localeInput;
  const dictionary = getDictionary(locale);
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const canadaWeek = getCanadaWeekNumber(today);
  const isoWeek = getIsoWeekNumber(today);
  const caStart = startOfCanadaWeek(today);
  const caEnd = new Date(caStart);
  caEnd.setUTCDate(caStart.getUTCDate() + 6);
  const isoStart = startOfIsoWeek(today);
  const isoEnd = new Date(isoStart);
  isoEnd.setUTCDate(isoStart.getUTCDate() + 6);

  return (
    <main className="container">
      <section className="hero">
        <h1>{locale === "fr" ? "Numéro de semaine actuel au Canada" : "Current Week Number in Canada"}</h1>
        <p className="subtle" style={{ maxWidth: "800px", margin: "1rem auto", lineHeight: 1.6 }}>
          {locale === "fr"
            ? "Voici le numéro de semaine actuel au Canada aujourd’hui, avec la plage de dates exacte pour la semaine « Canada » (généralement dimanche à samedi) et la semaine ISO 8601 (lundi à dimanche). Utile pour la paie, l’école, les échéances et l’alignement avec des outils ou des partenaires internationaux."
            : "See the current week number in Canada today, with the exact date range for the common Canada week (usually Sunday–Saturday) and the ISO 8601 week (Monday–Sunday). Use it for payroll, school terms, deadlines, and staying aligned with international tools or partners."}
        </p>
        <p className="currentWeek">
          {locale === "fr" ? "Semaine Canada" : "Canada week"}: <strong>{canadaWeek}</strong>
        </p>
        <p className="subtle">
          {formatDateLong(caStart, localeCode, defaultCanadaTimeZone)} - {formatDateLong(caEnd, localeCode, defaultCanadaTimeZone)}
        </p>
        <p className="currentWeek">
          ISO 8601: <strong>{isoWeek}</strong>
        </p>
        <p className="subtle">
          {formatDateLong(isoStart, localeCode, defaultCanadaTimeZone)} - {formatDateLong(isoEnd, localeCode, defaultCanadaTimeZone)}
        </p>
        <p>
          <Link href={`/${locale}`}>{dictionary.brand}</Link>
        </p>
      </section>
    </main>
  );
}
