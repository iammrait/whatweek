import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DaysCalculator } from "@/components/DaysCalculator";
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
  const title = isFr ? "Jours entre deux dates — calculatrice" : "Days Between Two Dates Calculator";
  const description = isFr
    ? "Comptez le nombre exact de jours entre deux dates au Canada — semaines, mois, années inclus. Idéal pour facturation, projets et planification."
    : "Count the exact number of days between two dates in Canada — with weeks, months, and years included. Ideal for billing, projects, and planning.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/days-between"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/days-between`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function DaysBetweenPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setUTCMonth(today.getUTCMonth() - 1);

  const faq = [
    {
      question: isFr ? "Comment compter les jours entre deux dates ?" : "How do I count the days between two dates?",
      answer: isFr
        ? "Choisissez les deux dates. Le calculateur retourne la différence exacte en jours, ainsi que la conversion en semaines, mois et années."
        : "Pick the two dates. The calculator returns the exact difference in days, plus conversions to weeks, months, and years.",
    },
    {
      question: isFr ? "L'ordre des dates a-t-il de l'importance ?" : "Does the order of the dates matter?",
      answer: isFr
        ? "Le résultat absolu est identique. Si la date de fin précède la date de début, le calculateur indique « passé »."
        : "The absolute result is the same. If the end date is before the start date, the calculator labels the result as 'in the past'.",
    },
    {
      question: isFr ? "Est-ce inclusif ou exclusif ?" : "Is it inclusive or exclusive?",
      answer: isFr
        ? "C'est exclusif : le compte est la différence en jours entre les deux dates. Pour inclure les deux extrémités, ajoutez 1 au résultat."
        : "It is exclusive: the count is the difference in days between the two dates. To include both endpoints, add 1 to the result.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isFr ? "Jours entre deux dates" : "Days Between Two Dates",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    url: `https://whatweek.ca/${locale}/days-between`,
    inLanguage: isFr ? "fr-CA" : "en-CA",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  };
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [buildBreadcrumbJsonLd(locale, [{ name: isFr ? "Jours entre deux dates" : "Days between dates", path: "/days-between" }]), faqJsonLd, softwareAppJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Jours entre deux dates" : "Days between dates"}</span>
        </nav>
        <h1>{isFr ? "Jours entre deux dates" : "Days Between Two Dates"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Calculez le nombre de jours qui séparent deux dates, avec conversion en semaines, mois et années."
            : "Calculate the number of days between two dates, with conversions to weeks, months, and years."}
        </p>
      </section>

      <section className="panel">
        <DaysCalculator locale={locale} defaultStart={ymd(oneMonthAgo)} defaultEnd={ymd(today)} defaultMode="between" />
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
          <Link href={`/${locale}/days-until`} prefetch={false}>
            {isFr ? "Jours jusqu'à" : "Days until"}
          </Link>
          <Link href={`/${locale}/weeks-between`} prefetch={false}>
            {isFr ? "Semaines entre" : "Weeks between"}
          </Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>
            {isFr ? "Jours ouvrables" : "Business days"}
          </Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {isFr ? "Date ↔ semaine" : "Date ↔ week"}
          </Link>
        </div>
      </section>
    </main>
  );
}
