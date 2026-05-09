import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessDaysCalculator } from "@/components/BusinessDaysCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { getHolidaysForYear, type Holiday } from "@/lib/holidays-ca";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { getTodayInTimeZone } from "@/lib/week";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr
    ? "Calculatrice de jours ouvrables au Canada"
    : "Canadian Business Days Calculator";
  const description = isFr
    ? "Comptez les jours ouvrables entre deux dates ou ajoutez N jours ouvrables, en excluant les week-ends et les jours fériés canadiens par province."
    : "Count business days between two dates or add N business days, with Canadian provincial statutory holidays automatically excluded.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    alternates: buildLocaleAlternates("/business-days-calculator"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/business-days-calculator`,
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

function holidayToDto(holiday: Holiday) {
  return {
    date: `${holiday.date.getUTCFullYear()}-${String(holiday.date.getUTCMonth() + 1).padStart(2, "0")}-${String(holiday.date.getUTCDate()).padStart(2, "0")}`,
    nameEn: holiday.nameEn,
    nameFr: holiday.nameFr,
    global: holiday.global,
    counties: holiday.counties,
  };
}

export default async function BusinessDaysPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const startYear = today.getUTCFullYear();
  const yearsToFetch = [startYear - 1, startYear, startYear + 1, startYear + 2];
  const lists = await Promise.all(yearsToFetch.map((year) => getHolidaysForYear(year)));
  const holidaysByYear: Record<string, ReturnType<typeof holidayToDto>[]> = {};
  yearsToFetch.forEach((year, index) => {
    holidaysByYear[String(year)] = lists[index].map(holidayToDto);
  });

  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today);
  defaultEnd.setUTCDate(today.getUTCDate() + 30);

  const faq = [
    {
      question: isFr
        ? "Comment les jours fériés sont-ils gérés ?"
        : "How are statutory holidays handled?",
      answer: isFr
        ? "L’outil charge les jours fériés du Canada via Nager.Date et exclut automatiquement ceux applicables à la province sélectionnée. « Tout le Canada » correspond aux jours fériés fédéraux/nationaux."
        : "The tool loads Canadian holidays from Nager.Date and excludes those that apply to the chosen province. ‘All Canada’ uses federal/national holidays only.",
    },
    {
      question: isFr
        ? "Est-ce que les week-ends sont comptés ?"
        : "Are weekends counted?",
      answer: isFr
        ? "Non. Le samedi et le dimanche sont toujours exclus du décompte des jours ouvrables."
        : "No. Saturdays and Sundays are always excluded from the business-day count.",
    },
    {
      question: isFr
        ? "Le mode « ajouter » accepte-t-il des nombres négatifs ?"
        : "Does the ‘add days’ mode accept negative numbers?",
      answer: isFr
        ? "Oui — entrez une valeur négative pour reculer du nombre de jours ouvrables indiqué."
        : "Yes — enter a negative value to step backward by that many business days.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isFr
      ? "Compter les jours ouvrables au Canada"
      : "Count business days in Canada",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isFr ? "Choisir la province" : "Pick the province",
        text: isFr
          ? "Sélectionnez la province pour appliquer les jours fériés statutaires correspondants."
          : "Select the province so the right statutory holiday set is applied.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isFr ? "Choisir les dates" : "Pick the dates",
        text: isFr
          ? "Entrez la date de début et la date de fin, ou un nombre de jours ouvrables à ajouter."
          : "Enter the start and end dates, or a number of business days to add.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isFr ? "Lire le résultat" : "Read the result",
        text: isFr
          ? "Le total de jours ouvrables apparaît instantanément, sans week-ends ni jours fériés."
          : "The business-day total updates instantly, with weekends and statutory holidays already removed.",
      },
    ],
  };

  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isFr ? "Calculatrice de jours ouvrables au Canada" : "Canadian Business Days Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    url: `https://whatweek.ca/${locale}/business-days-calculator`,
    inLanguage: isFr ? "fr-CA" : "en-CA",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [faqJsonLd, howToJsonLd, softwareAppJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={startYear} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{isFr ? "Jours ouvrables" : "Business days"}</span>
        </nav>
        <h1>
          {isFr ? "Calculatrice de jours ouvrables au Canada" : "Canadian Business Days Calculator"}
        </h1>
        <p className="subtle heroLead">
          {isFr
            ? "Comptez les jours ouvrables entre deux dates ou ajoutez/soustrayez N jours ouvrables. Les week-ends et les jours fériés canadiens (par province) sont exclus automatiquement."
            : "Count business days between two dates, or add/subtract N business days. Weekends and Canadian statutory holidays (by province) are excluded automatically."}
        </p>
      </section>

      <section className="panel">
        <BusinessDaysCalculator
          locale={locale}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd.toISOString().slice(0, 10)}
          defaultProvince={null}
          holidaysByYear={holidaysByYear}
        />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Comment ça fonctionne" : "How it works"}</h2>
        <p>
          {isFr
            ? "Le décompte de jours ouvrables exclut le samedi, le dimanche et chaque jour férié statutaire applicable à la province sélectionnée. Les jours fériés proviennent de l’API publique Nager.Date pour le Canada, ce qui couvre les jours fériés nationaux et provinciaux."
            : "Business-day counts exclude Saturday, Sunday, and every statutory holiday that applies to the selected province. Holiday data is sourced from the Nager.Date public API for Canada, covering national and provincial observances."}
        </p>
        <p>
          {isFr
            ? "Le mode « Ajouter » avance ou recule jour par jour à partir d’une date de départ et compte uniquement les jours ouvrables. C’est l’outil de référence pour les délais légaux, les SLA, la livraison et la planification de projet."
            : "The ‘Add’ mode steps forward or backward one day at a time from a starting date, counting only business days. It’s the go-to tool for legal deadlines, SLAs, delivery promises, and project planning."}
        </p>
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
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {isFr ? "Convertisseur date ↔ semaine" : "Date ↔ Week converter"}
          </Link>
          <Link href={`/${locale}/pay-period-calculator`} prefetch={false}>
            {isFr ? "Périodes de paie" : "Pay-period calculator"}
          </Link>
          <Link href={`/${locale}/long-weekends/${startYear}`} prefetch={false}>
            {isFr ? `Longs week-ends ${startYear}` : `${startYear} long weekends`}
          </Link>
          <Link href={`/${locale}/calendar/${startYear}`} prefetch={false}>
            {isFr ? `Calendrier ${startYear}` : `${startYear} calendar`}
          </Link>
        </div>
      </section>
    </main>
  );
}
