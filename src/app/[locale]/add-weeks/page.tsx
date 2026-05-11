import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddSubtractWeeks } from "@/components/AddSubtractWeeks";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildLocaleAlternates, buildWebApplicationJsonLd } from "@/lib/seo-metadata";
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
  const title = isFr ? "Ajouter des semaines à une date" : "Add Weeks to a Date Calculator";
  const description = isFr
    ? "Ajoutez N semaines à n'importe quelle date pour obtenir la date finale, le jour de la semaine et la semaine ISO."
    : "Add N weeks to any date and get the resulting date, weekday, and ISO week number — instantly. Free, bilingual.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["ajouter des semaines à une date", "calculateur de date", "plus n semaines", "prochaine date", "calculateur de temps"]
      : ["add weeks to date", "date calculator", "plus n weeks", "future date calculator", "time calculator"],
    alternates: buildLocaleAlternates("/add-weeks"),
    openGraph: { title, description, type: "website", url: `https://whatweek.ca/${locale}/add-weeks`, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function AddWeeksPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);

  const faq = [
    {
      question: isFr ? "Comment ajouter des semaines à une date ?" : "How do I add weeks to a date?",
      answer: isFr
        ? "Sélectionnez la date de départ, entrez le nombre de semaines à ajouter, et le calculateur retourne la date finale avec son jour de la semaine et son numéro de semaine ISO."
        : "Pick the start date, enter how many weeks to add, and the calculator returns the resulting date along with its weekday and ISO week number.",
    },
    {
      question: isFr ? "Puis-je soustraire ?" : "Can I subtract instead?",
      answer: isFr
        ? "Oui — utilisez l'onglet « Soustraire » ou la page Soustraire des semaines."
        : "Yes — use the 'Subtract' tab or the dedicated Subtract Weeks page.",
    },
    {
      question: isFr ? "Comment c'est calculé ?" : "How is it calculated?",
      answer: isFr
        ? "On ajoute N × 7 jours à la date sélectionnée, en UTC, puis on retourne le résultat. Cela évite les ambiguïtés liées au changement d'heure."
        : "We add N × 7 days to the selected date in UTC, then return the result. This avoids ambiguity around daylight-saving transitions.",
    },
  ];

  const title = isFr ? "Ajouter des semaines à une date" : "Add Weeks to a Date Calculator";
  const description = isFr
    ? "Ajoutez N semaines à n'importe quelle date pour obtenir la date finale, le jour de la semaine et la semaine ISO."
    : "Add N weeks to any date and get the resulting date, weekday, and ISO week number — instantly. Free, bilingual.";

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [{ name: isFr ? "Ajouter" : "Add weeks", path: "/add-weeks" }]);
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: title,
    description,
    url: `https://whatweek.ca/${locale}/add-weeks`,
  });

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isFr ? "Comment ajouter des semaines à une date" : "How to add weeks to a date",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isFr ? "Choisir la date de départ" : "Pick the start date",
        text: isFr ? "Sélectionnez la date initiale dans le calendrier." : "Select the initial date in the date picker.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isFr ? "Saisir le nombre de semaines" : "Enter number of weeks",
        text: isFr ? "Entrez le nombre de semaines à ajouter." : "Input the number of weeks you want to add.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isFr ? "Lire la date finale" : "Read the final date",
        text: isFr
          ? "L'outil affiche immédiatement la date résultante et sa semaine ISO."
          : "The tool instantly displays the resulting date and its ISO week.",
      },
    ],
  };

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, faqJsonLd, webAppJsonLd, howToJsonLd],
  };

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphJsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Ajouter des semaines" : "Add weeks"}</span>
        </nav>
        <h1>{isFr ? "Ajouter des semaines à une date" : "Add Weeks to a Date"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Combien de semaines voulez-vous ajouter ? Le calculateur retourne la date résultante avec son jour de la semaine et la semaine ISO."
            : "How many weeks do you want to add? The calculator returns the resulting date with its weekday and ISO week."}
        </p>
      </section>

      <section className="panel">
        <AddSubtractWeeks locale={locale} defaultStart={ymd(today)} defaultWeeks="4" defaultMode="add" />
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
          <Link href={`/${locale}/subtract-weeks`} prefetch={false}>{isFr ? "Soustraire des semaines" : "Subtract weeks"}</Link>
          <Link href={`/${locale}/weeks-between`} prefetch={false}>{isFr ? "Semaines entre" : "Weeks between"}</Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>{isFr ? "Jours ouvrables" : "Business days"}</Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date ↔ semaine" : "Date ↔ week"}</Link>
        </div>
      </section>
    </main>
  );
}
