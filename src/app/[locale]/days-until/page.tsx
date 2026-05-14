import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DaysCalculator } from "@/components/DaysCalculator";
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
  const title = isFr ? "Combien de jours jusqu'à une date ?" : "How Many Days Until — Countdown Calculator";
  const description = isFr
    ? "Calculez instantanément combien de jours il reste jusqu'à n'importe quelle date au Canada — Noël, Fête du Canada, anniversaires, échéances de projet."
    : "Instantly calculate how many days until any date in Canada — Christmas, Canada Day, birthdays, project deadlines, holidays. Free and bilingual.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    keywords: isFr
      ? ["jours jusqu'à", "compte à rebours jours", "combien de jours avant", "calculateur de jours", "temps restant jours"]
      : ["days until date", "days countdown", "how many days", "day counter", "days remaining calculator"],
    alternates: buildLocaleAlternates("/days-until"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/days-until`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function DaysUntilLandingPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";

  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const defaultStart = ymd(today);
  const christmas = new Date(today);
  if (today.getUTCMonth() > 11 || (today.getUTCMonth() === 11 && today.getUTCDate() > 25)) {
    christmas.setUTCFullYear(today.getUTCFullYear() + 1);
  }
  christmas.setUTCMonth(11, 25);
  const defaultEnd = ymd(christmas);

  const popularLinks = popularCanadianDates.map((entry) => {
    const next = resolvePopularDate(entry, today);
    return {
      slug: entry.slug,
      label: isFr ? entry.labelFr : entry.labelEn,
      iso: ymd(next),
      year: next.getUTCFullYear(),
    };
  });

  const faq = [
    {
      question: isFr ? "Comment calculer le nombre de jours jusqu'à une date ?" : "How do I calculate the number of days until a date?",
      answer: isFr
        ? "Choisissez la date de départ (par défaut aujourd'hui) puis la date cible. Le calculateur compte le nombre exact de jours en utilisant un fuseau horaire canadien."
        : "Pick the start date (defaults to today) and the target date. The calculator counts the exact number of days using a Canadian time zone, so the answer always reflects today's value.",
    },
    {
      question: isFr ? "Le compte inclut-il aujourd'hui ?" : "Does the count include today?",
      answer: isFr
        ? "Non. Nous comptons les jours entre deux dates exclusivement — aujourd'hui = 0, demain = 1, etc. C'est la convention standard pour les comptes à rebours."
        : "No. We count exclusive days between dates — today = 0, tomorrow = 1, etc. This is the standard convention for countdowns and project planning.",
    },
    {
      question: isFr ? "Puis-je l'utiliser pour des dates passées ?" : "Can I use it for past dates?",
      answer: isFr
        ? "Oui. Si la date cible est antérieure à la date de départ, le calculateur affiche le nombre de jours écoulés avec une étiquette « passé »."
        : "Yes. If the target date is earlier than the start date, the calculator shows the number of days elapsed and labels the result as 'in the past'.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isFr ? "Calculatrice « Combien de jours jusqu'à »" : "Days Until Countdown Calculator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    url: `https://whatweek.ca/${locale}/days-until`,
    inLanguage: isFr ? "fr-CA" : "en-CA",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  };
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [buildBreadcrumbJsonLd(locale, [{ name: isFr ? "Jours jusqu'à" : "Days until", path: "/days-until" }]), faqJsonLd, softwareAppJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main id="main-content" className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Jours jusqu'à" : "Days until"}</span>
        </nav>
        <h1>{isFr ? "Combien de jours jusqu'à une date ?" : "How Many Days Until — Countdown Calculator"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Comptez le nombre exact de jours jusqu'à n'importe quelle date — fériés, anniversaires, échéances. Mis à jour en direct selon un fuseau horaire canadien."
            : "Count the exact number of days until any date — holidays, birthdays, deadlines, milestones. Updated live using a Canadian time zone."}
        </p>
      </section>

      <section className="panel">
        <DaysCalculator locale={locale} defaultStart={defaultStart} defaultEnd={defaultEnd} defaultMode="until" />
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Comptes à rebours populaires au Canada" : "Popular Canadian countdowns"}</h2>
        <div className="linkGrid">
          {popularLinks.map((entry) => (
            <Link key={entry.slug} href={`/${locale}/days-until/${entry.iso}`} prefetch={false}>
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
          <Link href={`/${locale}/days-between`} prefetch={false}>
            {isFr ? "Jours entre deux dates" : "Days between dates"}
          </Link>
          <Link href={`/${locale}/weeks-until`} prefetch={false}>
            {isFr ? "Semaines jusqu'à" : "Weeks until"}
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
