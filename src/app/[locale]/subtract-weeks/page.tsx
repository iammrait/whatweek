import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddSubtractWeeks } from "@/components/AddSubtractWeeks";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildFaqJsonLd, buildLocaleAlternates } from "@/lib/seo-metadata";
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
  const title = isFr ? "Soustraire des semaines d'une date" : "Subtract Weeks from a Date Calculator";
  const description = isFr
    ? "Soustrayez N semaines d'une date pour retrouver la date passée, le jour de la semaine et la semaine ISO correspondante."
    : "Subtract N weeks from any date and get the past date, weekday, and matching ISO week number — instantly.";
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates("/subtract-weeks"),
    openGraph: { title, description, type: "website", url: `https://whatweek.ca/${locale}/subtract-weeks`, locale: isFr ? "fr_CA" : "en_CA", images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function SubtractWeeksPage({ params }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);

  const faq = [
    {
      question: isFr ? "Comment soustraire des semaines ?" : "How do I subtract weeks?",
      answer: isFr
        ? "Sélectionnez la date de départ et le nombre de semaines à soustraire. Le calculateur retourne la date passée correspondante."
        : "Pick a start date and the number of weeks to subtract. The calculator returns the matching past date.",
    },
    {
      question: isFr ? "Puis-je remonter dans le passé ?" : "Can I go further back in time?",
      answer: isFr
        ? "Oui — il n'y a pas de limite pratique. Vous pouvez soustraire des centaines de semaines."
        : "Yes — there is no practical limit. You can subtract hundreds of weeks.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(faqJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <span>{isFr ? "Soustraire des semaines" : "Subtract weeks"}</span>
        </nav>
        <h1>{isFr ? "Soustraire des semaines d'une date" : "Subtract Weeks from a Date"}</h1>
        <p className="subtle heroLead">
          {isFr
            ? "Entrez une date et le nombre de semaines à soustraire pour retrouver la date passée."
            : "Enter a date and how many weeks to subtract to find the resulting past date."}
        </p>
      </section>

      <section className="panel">
        <AddSubtractWeeks locale={locale} defaultStart={ymd(today)} defaultWeeks="4" defaultMode="subtract" />
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
          <Link href={`/${locale}/add-weeks`} prefetch={false}>{isFr ? "Ajouter des semaines" : "Add weeks"}</Link>
          <Link href={`/${locale}/weeks-between`} prefetch={false}>{isFr ? "Semaines entre" : "Weeks between"}</Link>
          <Link href={`/${locale}/business-days-calculator`} prefetch={false}>{isFr ? "Jours ouvrables" : "Business days"}</Link>
          <Link href={`/${locale}/date-to-week`} prefetch={false}>{isFr ? "Date ↔ semaine" : "Date ↔ week"}</Link>
        </div>
      </section>
    </main>
  );
}
