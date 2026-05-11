import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DateWeekConverter } from "@/components/DateWeekConverter";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildLocaleAlternates,
  buildWebApplicationJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo-metadata";
import { getSitemapLastmod } from "@/lib/sitemap-lastmod";
import {
  getCanadaWeekNumber,
  getIsoWeekNumber,
  getIsoWeekYear,
  getTodayInTimeZone,
  getWeeksInIsoYear,
} from "@/lib/week";

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
  const title = isFr ? "Convertisseur date ↔ semaine" : "Date ↔ Week Number Converter";
  const description = isFr
    ? "Convertissez instantanément une date en numéro de semaine ISO ou Canada, ou un numéro de semaine en plage de dates. Couvre 1900–2100."
    : "Instantly convert any date to its ISO or Canada week number, or convert a week number back to its date range. Covers 1900–2100.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;

  return {
    title,
    description,
    keywords: isFr
      ? ["date en numéro de semaine", "semaine en date", "convertisseur semaine iso", "numéro de semaine canada", "calculateur plage de dates", "calendrier semaine"]
      : ["date to week number", "week number to date", "iso week converter", "canada week number", "week range calculator", "date converter"],
    alternates: buildLocaleAlternates("/date-to-week"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/date-to-week`,
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

export default async function DateToWeekPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const defaultDate = today.toISOString().slice(0, 10);
  const defaultYear = getIsoWeekYear(today);
  const defaultWeek = getIsoWeekNumber(today);
  const canadaWeek = getCanadaWeekNumber(today);
  const weeksInYear = getWeeksInIsoYear(defaultYear);

  const faq = [
    {
      question: isFr
        ? "Comment trouver le numéro de semaine d’une date ?"
        : "How do I find the week number for a specific date?",
      answer: isFr
        ? "Choisissez le mode « Date → Semaine », sélectionnez la date et obtenez immédiatement la semaine ISO 8601, la semaine Canada (dim–sam), le jour de la semaine et le jour de l’année."
        : "Switch to the Date → Week mode, pick the date, and you’ll instantly see its ISO 8601 week, Canada (Sun–Sat) week, weekday, and day-of-year.",
    },
    {
      question: isFr
        ? "Comment convertir un numéro de semaine en dates ?"
        : "How do I convert a week number into a date range?",
      answer: isFr
        ? "Utilisez le mode « Semaine → Dates » et entrez l’année ISO et le numéro de semaine. La plage du lundi au dimanche s’affiche, ainsi que le nombre total de semaines dans l’année."
        : "Use the Week → Dates mode and enter the ISO year + week number. The Monday–Sunday range is shown along with the total number of ISO weeks in that year.",
    },
    {
      question: isFr
        ? "Pourquoi la semaine Canada peut différer de la semaine ISO ?"
        : "Why does the Canada week sometimes differ from the ISO week?",
      answer: isFr
        ? "La semaine ISO 8601 commence un lundi et la semaine Canada commence un dimanche. Autour du 1ᵉʳ janvier et du 31 décembre, le numéro peut varier de 1."
        : "ISO 8601 weeks start on Monday; Canadian Sun–Sat weeks start on Sunday. Around January 1 and December 31, the two numbering systems can disagree by 1.",
    },
    {
      question: isFr
        ? `Combien de semaines y a-t-il en ${defaultYear} ?`
        : `How many weeks are in ${defaultYear}?`,
      answer: isFr
        ? `${defaultYear} compte ${weeksInYear} semaines ISO.`
        : `${defaultYear} contains ${weeksInYear} ISO weeks.`,
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isFr ? "Convertir une date en numéro de semaine" : "Convert a date to a week number",
    description: isFr
      ? "Étapes pour obtenir le numéro de semaine ISO ou Canada à partir d’une date au Canada."
      : "Steps to look up the ISO or Canada week number for any calendar date.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isFr ? "Choisir la date" : "Pick the date",
        text: isFr
          ? "Sélectionnez la date dans le calendrier."
          : "Select the date you want to convert in the date picker.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isFr ? "Lire le numéro de semaine" : "Read the week number",
        text: isFr
          ? "Le numéro ISO 8601 et le numéro Canada (dim–sam) s’affichent immédiatement."
          : "The ISO 8601 and Canada (Sun–Sat) week numbers update instantly with the date range.",
      },
    ],
  };

  const title = isFr
    ? "Convertisseur date ↔ numéro de semaine"
    : "Date ↔ Week Number Converter";
  const description = isFr
    ? "Convertissez n'importe quelle date en numéro de semaine ISO ou Canada, avec les dates de début et de fin correspondantes."
    : "Convert any date to an ISO or Canada week number, with the corresponding start and end dates shown instantly.";

  const lastModified = await getSitemapLastmod(locale, "/date-to-week");
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [{ name: title, path: "/date-to-week" }]);
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: title,
    description,
    url: `https://whatweek.ca/${locale}/date-to-week`,
  });
  const webPageJsonLd = buildWebPageJsonLd({
    locale,
    name: title,
    description,
    url: `https://whatweek.ca/${locale}/date-to-week`,
    dateModified: lastModified,
    isSpeakable: true,
  });

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, faqJsonLd, howToJsonLd, webAppJsonLd, webPageJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} year={defaultYear} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>
            {isFr ? "Accueil" : "Home"}
          </Link>
          <span> / </span>
          <span>{isFr ? "Convertisseur date ↔ semaine" : "Date ↔ Week converter"}</span>
        </nav>
        <h1>{isFr ? "Convertisseur date ↔ semaine" : "Date ↔ Week Number Converter"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? `Aujourd’hui : semaine ISO ${defaultWeek} de ${defaultYear} (semaine Canada ${canadaWeek}). Utilisez l’outil ci-dessous pour n’importe quelle date entre 1900 et 2100.`
            : `Today is ISO week ${defaultWeek} of ${defaultYear} (Canada week ${canadaWeek}). Use the tool below for any date between 1900 and 2100.`}
        </p>
      </section>

      <section className="panel">
        <DateWeekConverter
          locale={locale}
          defaultDate={defaultDate}
          defaultYear={defaultYear}
          defaultWeek={defaultWeek}
        />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Comprendre les numéros de semaine au Canada" : "Understanding Week Numbers in Canada"}</h2>
        <p>
          {isFr
            ? "Au Canada, deux systèmes de numérotation des semaines coexistent souvent. Le standard international (ISO 8601) commence la semaine le lundi et est utilisé universellement dans les logiciels, la logistique et les affaires mondiales. Cependant, de nombreuses institutions canadiennes et calendriers personnels commencent la semaine le dimanche."
            : "In Canada, two week-numbering systems often coexist. The international standard (ISO 8601) starts the week on Monday and is used universally in software, logistics, and global business. However, many Canadian institutions and personal calendars start the week on Sunday."}
        </p>
        <p>
          {isFr
            ? "Notre convertisseur calcule les deux simultanément. Le mode « Date → Semaine » prend une date civile et calcule à la fois le numéro de semaine ISO 8601 (lun–dim) et le numéro de semaine Canada (dim–sam). Il affiche aussi le jour de la semaine et le jour de l’année—essentiel pour la paie, la planification de projet et les calendriers scolaires."
            : "Our converter calculates both simultaneously. The ‘Date → Week’ mode takes a calendar date and computes both the ISO 8601 week number (Mon–Sun) and the Canada week number (Sun–Sat). It also reports the weekday and day-of-year—essential for payroll, project planning, and school schedules."}
        </p>
        <p>
          {isFr
            ? "Le mode « Semaine → Dates » fonctionne dans l'autre sens : entrez une année et un numéro de semaine ISO pour obtenir la plage de dates exacte. C'est l'outil idéal pour traduire les dates de livraison « Semaine 42 » en jours civils concrets."
            : "The ‘Week → Dates’ mode works the other way: enter an ISO year and week number to get the exact date range. This is the perfect tool for translating 'Week 42' delivery dates into concrete calendar days."}
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
          <Link href={`/${locale}/calendar/${defaultYear}`} prefetch={false}>
            {isFr ? `Calendrier ${defaultYear}` : `${defaultYear} calendar`}
          </Link>
          <Link href={`/${locale}/week/${defaultYear}/${defaultWeek}`} prefetch={false}>
            {isFr ? `Semaine ${defaultWeek} ${defaultYear}` : `Week ${defaultWeek} ${defaultYear}`}
          </Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>
            {isFr ? "Jours ouvrables" : "Business days calculator"}
          </Link>
          <Link href={`/${locale}/long-weekends/${defaultYear}`} prefetch={false}>
            {isFr ? `Longs week-ends ${defaultYear}` : `${defaultYear} long weekends`}
          </Link>
        </div>
      </section>
    </main>
  );
}
