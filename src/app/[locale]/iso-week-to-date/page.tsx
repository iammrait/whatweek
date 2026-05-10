import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IsoWeekToDateForm } from "@/components/IsoWeekToDateForm";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { getIsoWeekNumber, getIsoWeekYear, getTodayInTimeZone } from "@/lib/week";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "Semaine ISO → date — convertisseur" : "ISO Week to Date Converter";
  const description = isFr
    ? "Convertissez un numéro de semaine ISO 8601 et une année en plage de dates lundi–dimanche, avec contexte Canada et calendrier."
    : "Convert any ISO 8601 week number and year into its Monday–Sunday date range, with Canadian calendar context and quick links.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/iso-week-to-date"),
    openGraph: { title, description, type: "website", url: `https://whatweek.ca/${locale}/iso-week-to-date`, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function IsoWeekToDatePage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const defaultYear = getIsoWeekYear(today);
  const defaultWeek = getIsoWeekNumber(today);

  const faq = [
    {
      question: isFr ? "Comment convertir un numéro de semaine en date ?" : "How do I convert a week number to a date?",
      answer: isFr
        ? "Entrez l'année ISO et le numéro de semaine. Le convertisseur retourne la plage lundi–dimanche correspondante (ISO 8601) ainsi que les sept jours individuels."
        : "Enter the ISO year and week number. The converter returns the matching Monday–Sunday range (ISO 8601) plus the seven individual days.",
    },
    {
      question: isFr ? "C'est quoi exactement la semaine ISO 8601 ?" : "What exactly is an ISO 8601 week?",
      answer: isFr
        ? "ISO 8601 commence chaque semaine un lundi et la semaine 1 contient le premier jeudi de l'année."
        : "ISO 8601 weeks start on Monday, and week 1 is the week containing the first Thursday of the year.",
    },
    {
      question: isFr ? "Pourquoi certaines années ont 53 semaines ?" : "Why do some years have 53 weeks?",
      answer: isFr
        ? "Quand le 1er janvier ou le 1er-2 janvier (année bissextile) est un jeudi, l'année ISO contient 53 semaines."
        : "When January 1 (or January 1–2 in a leap year) is a Thursday, the ISO year contains 53 weeks.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(faqJsonLd) }} />
      <SiteHeader locale={locale} year={defaultYear} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Semaine ISO → date" : "ISO week to date"}</span>
        </nav>
        <h1>{isFr ? "Convertisseur semaine ISO → date" : "ISO Week to Date Converter"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? `Aujourd'hui : semaine ISO ${defaultYear}-W${String(defaultWeek).padStart(2, "0")}. Entrez n'importe quelle année et semaine pour obtenir les dates lundi–dimanche.`
            : `Today is ISO ${defaultYear}-W${String(defaultWeek).padStart(2, "0")}. Enter any year and week to get the matching Monday–Sunday dates.`}
        </p>
      </section>

      <section className="panel">
        <IsoWeekToDateForm locale={locale} defaultYear={defaultYear} defaultWeek={defaultWeek} />
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
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date → semaine" : "Date → week"}</Link>
          <Link href={`/${locale}/calendar/${defaultYear}`} prefetch={false}>{isFr ? `Calendrier ${defaultYear}` : `${defaultYear} calendar`}</Link>
          <Link href={`/${locale}/week-by-year-index`} prefetch={false}>{isFr ? "Semaine par année" : "Week by year"}</Link>
          <Link href={`/${locale}/code-snippets/iso-week-number`} prefetch={false}>{isFr ? "Code semaine ISO" : "ISO week code snippets"}</Link>
        </div>
      </section>
    </main>
  );
}
