import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WeeksCalculator } from "@/components/WeeksCalculator";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
import { getTodayInTimeZone } from "@/lib/week";
import { popularCanadianDates, resolvePopularDate, ymd } from "@/lib/date-math";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr ? "Combien de semaines jusqu'à une date ?" : "How Many Weeks Until — Countdown Calculator";
  const description = isFr
    ? "Comptez les semaines complètes jusqu'à une date au Canada — fériés, échéances de projet, semaine ISO, fractions de semaine."
    : "Count full weeks until any date in Canada — holidays, deadlines, ISO weeks, plus the exact fractional weeks remaining. Free and bilingual.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["semaines avant une date", "compte à rebours semaines", "combien de semaines", "temps restant", "calculateur de délais"]
      : ["weeks until date", "weeks countdown", "how many weeks", "time remaining", "deadline calculator"],
    alternates: buildLocaleAlternates("/weeks-until"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/weeks-until`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function WeeksUntilLandingPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const targetDefault = new Date(today);
  targetDefault.setUTCDate(today.getUTCDate() + 90);

  const popularLinks = popularCanadianDates.map((entry) => {
    const next = resolvePopularDate(entry, today);
    return { slug: entry.slug, label: isFr ? entry.labelFr : entry.labelEn, iso: ymd(next), year: next.getUTCFullYear() };
  });

  const faq = [
    {
      question: isFr ? "Comment calculer le nombre de semaines jusqu'à une date ?" : "How do I calculate the number of weeks until a date?",
      answer: isFr
        ? "Sélectionnez la date cible. Le calculateur retourne le nombre de semaines complètes plus les jours résiduels, ainsi que la valeur exacte (avec décimales)."
        : "Pick the target date. The calculator returns full weeks plus remainder days, as well as the exact decimal weeks remaining.",
    },
    {
      question: isFr ? "Pourquoi voir les semaines complètes et exactes ?" : "Why show both full and exact weeks?",
      answer: isFr
        ? "Les semaines complètes (par ex. 5 semaines + 3 jours) sont utiles pour la planification de sprints. Les semaines exactes (par ex. 5,43) servent au suivi de progression."
        : "Full weeks (e.g. 5 weeks + 3 days) help with sprint planning. Exact weeks (e.g. 5.43) help with progress tracking and OKR check-ins.",
    },
    {
      question: isFr ? "Le compte est-il par semaines ISO ?" : "Are these ISO weeks?",
      answer: isFr
        ? "Non. Le compte est en jours / 7. Pour les numéros de semaine ISO 8601, voir la page semaine actuelle ou la conversion date → semaine."
        : "No. The count is days / 7. For ISO 8601 week numbers, see the current-week page or the date → week converter.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Semaines jusqu'à" : "Weeks until", path: "/weeks-until" },
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
          <span>{isFr ? "Semaines jusqu'à" : "Weeks until"}</span>
        </nav>
        <h1>{isFr ? "Combien de semaines jusqu'à une date ?" : "How Many Weeks Until — Countdown Calculator"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Choisissez une date cible et obtenez instantanément le nombre de semaines complètes et exactes jusqu'à celle-ci."
            : "Pick a target date and instantly see the number of full and exact weeks remaining until then."}
        </p>
      </section>

      <section className="panel">
        <WeeksCalculator locale={locale} defaultStart={ymd(today)} defaultEnd={ymd(targetDefault)} defaultMode="until" />
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Comptes à rebours populaires" : "Popular countdowns"}</h2>
        <div className="linkGrid">
          {popularLinks.map((entry) => (
            <Link key={entry.slug} href={`/${locale}/weeks-until/${entry.iso}`} prefetch={false}>
              {entry.label} · {entry.year}
            </Link>
          ))}
        </div>
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
          <Link href={`/${locale}/weeks-between`} prefetch={false}>
            {isFr ? "Semaines entre deux dates" : "Weeks between dates"}
          </Link>
          <Link href={`/${locale}/days-until`} prefetch={false}>
            {isFr ? "Jours jusqu'à" : "Days until"}
          </Link>
          <Link href={`/${locale}/add-weeks`} prefetch={false}>
            {isFr ? "Ajouter des semaines" : "Add weeks"}
          </Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>
            {isFr ? "Date ↔ semaine" : "Date ↔ week"}
          </Link>
        </div>
      </section>
    </main>
  );
}
