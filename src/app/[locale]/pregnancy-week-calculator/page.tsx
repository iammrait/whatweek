import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PregnancyWeekCalculator } from "@/components/PregnancyWeekCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildLocaleAlternates, buildWebApplicationJsonLd, buildWebPageJsonLd } from "@/lib/seo-metadata";
import { getSitemapLastmod } from "@/lib/sitemap-lastmod";
import { getTodayInTimeZone } from "@/lib/week";
import { addDays, ymd } from "@/lib/date-math";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr
    ? "Calculatrice de semaines de grossesse (DPA + ISO)"
    : "Pregnancy Week Calculator (Due Date + ISO Weeks)";
  const description = isFr
    ? "Calculatrice bilingue de grossesse : indiquez la date des dernières règles, la date prévue d'accouchement ou de conception. Affiche les 40 semaines, le trimestre, les jalons et la semaine ISO."
    : "Bilingual pregnancy calculator: enter your last menstrual period, due date, or conception date. Shows all 40 weeks, trimester, milestones, and ISO week of the due date.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["calculatrice de grossesse", "semaines de grossesse", "date d'accouchement", "suivi de grossesse", "calendrier de grossesse"]
      : ["pregnancy calculator", "pregnancy weeks", "due date calculator", "pregnancy tracker", "pregnancy calendar"],
    alternates: buildLocaleAlternates("/pregnancy-week-calculator"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/pregnancy-week-calculator`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function PregnancyWeekCalculatorPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const defaultLmp = addDays(today, -56); // ~8 weeks pregnant default

  const faq = [
    {
      question: isFr ? "Comment la date prévue est-elle calculée ?" : "How is the due date calculated?",
      answer: isFr
        ? "Selon la règle de Naegele : 280 jours (40 semaines) à partir du premier jour des dernières règles. La date de conception est estimée à environ 14 jours après le début des dernières règles."
        : "Using Naegele's rule: 280 days (40 weeks) from the first day of your last menstrual period. The conception date is estimated at about 14 days after the start of your last period.",
    },
    {
      question: isFr ? "Combien de semaines dure une grossesse ?" : "How many weeks is a full-term pregnancy?",
      answer: isFr
        ? "À terme, une grossesse dure 40 semaines (280 jours) à partir des dernières règles. Une naissance entre 37 et 42 semaines est considérée comme à terme."
        : "A full-term pregnancy lasts 40 weeks (280 days) measured from the last menstrual period. Births between 37 and 42 weeks are considered full-term.",
    },
    {
      question: isFr ? "Quels sont les trimestres ?" : "What are the trimesters?",
      answer: isFr
        ? "Premier trimestre : semaines 1–12. Deuxième trimestre : semaines 13–26. Troisième trimestre : semaines 27–40."
        : "First trimester: weeks 1–12. Second trimester: weeks 13–26. Third trimester: weeks 27–40.",
    },
    {
      question: isFr ? "Quelle est la semaine ISO de la DPA ?" : "What's the ISO week of my due date?",
      answer: isFr
        ? "Le calcul affiche le numéro de semaine ISO 8601 de la date prévue, utile pour aligner congés de maternité, planification d'équipe et logistique."
        : "The result shows the ISO 8601 week number of the due date — useful for aligning maternity leave, team scheduling, and logistics.",
    },
    {
      question: isFr ? "S'agit-il d'un avis médical ?" : "Is this medical advice?",
      answer: isFr
        ? "Non. Cet outil offre uniquement une estimation. Pour des dates précises, consultez votre professionnel de santé — l'échographie du premier trimestre reste la référence."
        : "No. This tool only provides estimates. For precise dating, consult your healthcare provider — first-trimester ultrasound remains the gold standard.",
    },
  ];

  const title = isFr
    ? "Calculatrice de semaines de grossesse (DPA + ISO)"
    : "Pregnancy Week Calculator (Due Date + ISO Weeks)";
  const description = isFr
    ? "Calculatrice bilingue de grossesse : indiquez la date des dernières règles, la date prévue d'accouchement ou de conception. Affiche les 40 semaines, le trimestre, les jalons et la semaine ISO."
    : "Bilingual pregnancy calculator: enter your last menstrual period, due date, or conception date. Shows all 40 weeks, trimester, milestones, and ISO week of the due date.";

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Semaines de grossesse" : "Pregnancy weeks", path: "/pregnancy-week-calculator" },
  ]);
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: title,
    description,
    url: `https://whatweek.ca/${locale}/pregnancy-week-calculator`,
  });

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isFr ? "Comment calculer sa semaine de grossesse" : "How to calculate your pregnancy week",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: isFr ? "Choisir le mode de calcul" : "Choose calculation mode",
        text: isFr ? "Sélectionnez : dernières règles, date prévue ou date de conception." : "Select: last period, due date, or conception date.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: isFr ? "Saisir la date" : "Enter the date",
        text: isFr ? "Entrez la date correspondant au mode choisi." : "Input the date corresponding to your chosen mode.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: isFr ? "Suivre son calendrier" : "Track your calendar",
        text: isFr
          ? "L'outil génère votre calendrier de 40 semaines avec les jalons clés."
          : "The tool generates your 40-week calendar with key milestones.",
      },
    ],
  };

  const lastModified = await getSitemapLastmod(locale, "/pregnancy-week-calculator");
  const webPageJsonLd = buildWebPageJsonLd({
    locale,
    name: isFr ? "Calculateur de semaine de grossesse" : "Pregnancy Week Calculator",
    description: isFr
      ? "Calculez votre semaine de grossesse actuelle et votre date d'accouchement."
      : "Calculate your current pregnancy week and estimated due date.",
    url: `https://whatweek.ca/${locale}/pregnancy-week-calculator`,
    dateModified: lastModified,
    isSpeakable: true,
  });

  const graphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbJsonLd, faqJsonLd, webAppJsonLd, howToJsonLd, webPageJsonLd],
  };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Calculatrice de grossesse" : "Pregnancy calculator"}</span>
        </nav>
        <h1>{isFr ? "Calculatrice de semaines de grossesse" : "Pregnancy Week Calculator"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Suivez les 40 semaines de grossesse, calculez la date prévue d'accouchement, le trimestre et la semaine ISO de la DPA — bilingue, sans inscription."
            : "Track all 40 pregnancy weeks, compute the estimated due date, trimester, and the ISO week of the due date — bilingual, no signup."}
        </p>
      </section>

      <section className="panel">
        <PregnancyWeekCalculator locale={locale} todayIso={ymd(today)} defaultLmpIso={ymd(defaultLmp)} />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Comment ça marche" : "How it works"}</h2>
        <p>
          {isFr
            ? "Choisissez l'un des trois modes (dernières règles, date prévue, conception). Nous appliquons la règle de Naegele : 280 jours = 40 semaines. Vous obtenez l'âge gestationnel actuel, la date prévue, le trimestre, les jalons toutes les 4 semaines et le numéro de semaine ISO 8601 de la DPA."
            : "Pick one of three modes (last period, due date, conception). We apply Naegele's rule: 280 days = 40 weeks. You get the current gestational age, due date, trimester, four-week milestones, and the ISO 8601 week number of the due date."}
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
          <Link href={`/${locale}/weeks-until`} prefetch={false}>
            {isFr ? "Semaines jusqu'à une date" : "Weeks until a date"}
          </Link>
          <Link href={`/${locale}/weeks-between`} prefetch={false}>
            {isFr ? "Semaines entre deux dates" : "Weeks between dates"}
          </Link>
          <Link href={`/${locale}/add-weeks`} prefetch={false}>
            {isFr ? "Ajouter des semaines" : "Add weeks"}
          </Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {isFr ? "Date ↔ semaine ISO" : "Date ↔ ISO week"}
          </Link>
        </div>
      </section>
    </main>
  );
}
