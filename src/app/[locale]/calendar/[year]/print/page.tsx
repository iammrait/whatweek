import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YearCalendar } from "@/components/YearCalendar";
import { PrintNowButton, PrintTrigger } from "@/components/PrintTrigger";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { buildLocaleAlternates } from "@/lib/seo-metadata";
import { getTodayInTimeZone, getWeeksInIsoYear, getYearCalendar } from "@/lib/week";
import { buildBreadcrumbJsonLd } from "@/lib/seo-metadata";

type Props = {
  params: Promise<{ locale: string; year: string }>;
};

const PRINT_YEAR_MIN = Math.min(2024, new Date().getUTCFullYear() - 2);
const PRINT_YEAR_MAX = Math.max(2030, new Date().getUTCFullYear() + 4);

function parseYear(input: string): number | null {
  const year = Number(input);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return null;
  return year;
}

export function generateStaticParams() {
  const years: Array<{ locale: string; year: string }> = [];
  for (const locale of locales) {
    for (let y = PRINT_YEAR_MIN; y <= PRINT_YEAR_MAX; y += 1) {
      years.push({ locale, year: String(y) });
    }
  }
  return years;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, year: yearInput } = await params;
  const year = parseYear(yearInput);
  if (!year || !isLocale(locale)) return {};
  const isFr = locale === "fr";
  const title = isFr
    ? `Calendrier imprimable ${year} (Canada) — WhatWeek.ca`
    : `Printable ${year} calendar (Canada) — WhatWeek.ca`;
  const description = isFr
    ? `Calendrier annuel ${year} prêt à imprimer pour le Canada avec numéros de semaine ISO 8601, format A4 et lettre.`
    : `Print-ready ${year} year-at-a-glance Canadian calendar with ISO 8601 week numbers, A4 and Letter friendly.`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates(`/calendar/${year}/print`),
  };
}

export default async function CalendarYearPrintPage({ params }: Props) {
  const { locale: localeInput, year: yearInput } = await params;
  const year = parseYear(yearInput);
  if (!year || !isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const dictionary = getDictionary(locale);
  const weeksInYear = getWeeksInIsoYear(year);
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const months = getYearCalendar(year, today, "iso");

  return (
    <main id="main-content" className="container printContainer">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(locale, [{ name: String(year), path: `/calendar/${year}` }, { name: isFr ? "Imprimer" : "Print", path: `/calendar/${year}/print` }])) }} />
      <PrintTrigger />

      <section className="hero printOnlyHeader">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>
          {isFr ? `Calendrier ${year} — Canada` : `${year} Calendar — Canada`}
        </h1>
        <p className="subtle" style={{ margin: "0.4rem 0 0" }}>
          {isFr
            ? `${weeksInYear} semaines ISO 8601 · whatweek.ca`
            : `${weeksInYear} ISO 8601 weeks · whatweek.ca`}
        </p>
      </section>

      <section className="printControls panel" aria-label={isFr ? "Options d'impression" : "Print options"}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem" }}>
              {isFr ? `Calendrier imprimable ${year}` : `Printable ${year} calendar`}
            </h1>
            <p className="subtle" style={{ margin: "0.25rem 0 0" }}>
              {isFr
                ? "Cette page est optimisée pour l'impression. Aperçu ci-dessous; utilisez Ctrl/⌘ + P pour ajuster les paramètres."
                : "This page is print-optimized. Preview below; use Ctrl/⌘ + P to fine-tune settings."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <PrintNowButton label={isFr ? "Imprimer" : "Print"} />
            <Link href={`/${locale}/calendar/${year}`} prefetch={false} className="ctaButton" style={{ textDecoration: "none" }}>
              {isFr ? "Retour au calendrier" : "Back to calendar"}
            </Link>
          </div>
        </div>
      </section>

      <YearCalendar dictionary={dictionary} locale={locale} months={months} year={year} system="iso" today={today} />

      <section className="printFooter subtle" aria-hidden="true">
        <p style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
          {isFr
            ? `whatweek.ca/${locale}/calendar/${year}/print · ISO 8601 · ${weeksInYear} semaines`
            : `whatweek.ca/${locale}/calendar/${year}/print · ISO 8601 · ${weeksInYear} weeks`}
        </p>
      </section>
    </main>
  );
}
