import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WeeksCalculator } from "@/components/WeeksCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { getTodayInTimeZone } from "@/lib/week";
import { ymd } from "@/lib/date-math";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "Semaines entre deux dates — calculatrice" : "Weeks Between Two Dates Calculator";
  const description = isFr
    ? "Calculez le nombre de semaines complètes et exactes entre deux dates au Canada — projets, factures, suivi de progression."
    : "Calculate the number of full and exact weeks between two dates in Canada — for projects, invoices, and progress tracking.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["semaines entre deux dates", "calculateur de durée", "nombre de semaines", "écart entre dates", "temps entre dates"]
      : ["weeks between two dates", "duration calculator", "number of weeks", "date difference", "time between dates"],
    alternates: buildLocaleAlternates("/weeks-between"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/weeks-between`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function WeeksBetweenPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const oneQuarterAgo = new Date(today);
  oneQuarterAgo.setUTCDate(today.getUTCDate() - 90);

  const faq = [
    {
      question: isFr ? "Combien de semaines y a-t-il entre deux dates ?" : "How many weeks are between two dates?",
      answer: isFr
        ? "Le nombre de semaines = nombre de jours / 7. Le calculateur affiche aussi les semaines complètes et les jours résiduels."
        : "Number of weeks = number of days / 7. The calculator also shows full weeks and remainder days.",
    },
    {
      question: isFr ? "Le compte est-il en semaines ISO ?" : "Are these ISO weeks?",
      answer: isFr
        ? "Non. C'est un simple écart en jours converti en semaines. Pour les numéros de semaine ISO 8601, voir la conversion date → semaine."
        : "No. It is a simple day-difference converted to weeks. For ISO 8601 week numbers, use the date → week converter.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Semaines entre deux dates" : "Weeks between dates", path: "/weeks-between" },
  ]);
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [breadcrumbJsonLd, faqJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Semaines entre deux dates" : "Weeks between dates"}</span>
        </nav>
        <h1>{isFr ? "Semaines entre deux dates" : "Weeks Between Two Dates"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Comptez les semaines complètes et exactes qui séparent deux dates."
            : "Count the full and exact weeks separating two dates."}
        </p>
      </section>

      <section className="panel">
        <WeeksCalculator locale={locale} defaultStart={ymd(oneQuarterAgo)} defaultEnd={ymd(today)} defaultMode="between" />
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
          <Link href={`/${locale}/weeks-until`} prefetch={false}>{isFr ? "Semaines jusqu'à" : "Weeks until"}</Link>
          <Link href={`/${locale}/days-between`} prefetch={false}>{isFr ? "Jours entre" : "Days between"}</Link>
          <Link href={`/${locale}/add-weeks`} prefetch={false}>{isFr ? "Ajouter des semaines" : "Add weeks"}</Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date ↔ semaine" : "Date ↔ week"}</Link>
        </div>
      </section>
    </main>
  );
}
