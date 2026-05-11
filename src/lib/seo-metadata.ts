import type { Locale } from "@/lib/i18n";
import { defaultCanadaTimeZone } from "@/lib/provinces";
import { getCanadaWeekNumber, getIsoWeekNumber, getTodayInTimeZone, startOfCanadaWeek, startOfIsoWeek } from "@/lib/week";

/** ISO week start (Monday) for ISO week calendar year `year`, week `week` (1-based). */
export function getIsoWeekPeriodStart(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4, 12, 0, 0));
  const firstWeekStart = startOfIsoWeek(jan4);
  const start = new Date(firstWeekStart);
  start.setUTCDate(firstWeekStart.getUTCDate() + (week - 1) * 7);
  return start;
}

/** Compact range for meta descriptions (keeps length in 120–155 chars with body copy). */
export function formatMetaDateRange(start: Date, end: Date, localeCode: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  };
  const a = new Intl.DateTimeFormat(localeCode, opts).format(start);
  const b = new Intl.DateTimeFormat(localeCode, opts).format(end);
  return `${a}–${b}`;
}

/**
 * Titles are intentionally short; `[locale]/layout.tsx` applies `%s | WhatWeek.ca`.
 * Target ~45–55 chars before suffix so the full title stays near SERP limits.
 */
export function weekDetailTitle(locale: Locale, year: number, week: number): string {
  return locale === "fr"
    ? `Semaine ${week} de ${year} au Canada`
    : `Week ${week} of ${year} in Canada`;
}

export function weekDetailDescription(locale: Locale, year: number, week: number): string {
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  const start = getIsoWeekPeriodStart(year, week);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const range = formatMetaDateRange(start, end, localeCode);

  if (locale === "fr") {
    return `Semaine ISO ${week} (${year}) au Canada, ${range}. Lundi–dimanche (ISO 8601), différence avec dim–sam, dates pour paie, école et congés.`;
  }
  return `ISO week ${week} of ${year} in Canada, ${range}. Full Monday–Sunday ISO 8601 range vs common Sun–Sat weeks, with dates for payroll, school, and holidays.`;
}

export function currentWeekCanadaTitle(locale: Locale): string {
  return locale === "fr"
    ? "Semaine actuelle au Canada — numéros ISO et Canada"
    : "Current week number in Canada — ISO & Canada weeks";
}

export function currentWeekCanadaDescription(locale: Locale): string {
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const canadaWeek = getCanadaWeekNumber(today);
  const isoWeek = getIsoWeekNumber(today);
  const caStart = startOfCanadaWeek(today);
  const caEnd = new Date(caStart);
  caEnd.setUTCDate(caStart.getUTCDate() + 6);
  const range = formatMetaDateRange(caStart, caEnd, localeCode);

  if (locale === "fr") {
    return `Numéro de semaine actuel au Canada : semaine ${canadaWeek} (${range}), et semaine ISO ${isoWeek}. Comparez dim–sam et ISO 8601 pour la paie, l’école et les congés.`;
  }
  return `Current week number in Canada today: Canada week ${canadaWeek} (${range}) and ISO week ${isoWeek}. Compare Sun–Sat and ISO 8601 weeks for payroll, school, and holidays.`;
}

export function isoWeekCanadaTitle(locale: Locale): string {
  return locale === "fr" ? "Semaine ISO 8601 au Canada" : "ISO 8601 week number in Canada";
}

export function isoWeekCanadaDescription(locale: Locale): string {
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  const today = getTodayInTimeZone(defaultCanadaTimeZone);
  const week = getIsoWeekNumber(today);
  const start = startOfIsoWeek(today);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const range = formatMetaDateRange(start, end, localeCode);

  if (locale === "fr") {
    return `Semaine ISO ${week} au Canada (${range}). Semaines du lundi au dimanche (ISO 8601), repères pour la paie, les échéances et le calendrier international.`;
  }
  return `ISO week ${week} in Canada (${range}). Monday–Sunday weeks per ISO 8601—useful for payroll cutoffs, planning, and aligning with international week numbers.`;
}

export function calendarYearTitle(locale: Locale, year: number): string {
  return locale === "fr" ? `Calendrier ${year} — semaines Canada` : `${year} Canada week-number calendar`;
}

export function calendarYearDescription(locale: Locale, year: number, weeksInYear: number): string {
  if (locale === "fr") {
    return `Calendrier ${year} au Canada : ${weeksInYear} semaines ISO, numéros de semaine par mois et liens vers chaque semaine—pratique pour la planification, la paie et les congés.`;
  }
  return `${year} week-number calendar for Canada: ${weeksInYear} ISO weeks, monthly grid with week numbers, and links to each week—handy for payroll, school, and holiday planning.`;
}

/** Home (locale root): concise title to stay within common SERP length bounds. */
export function homeCalendarTitle(locale: Locale, year: number, geoLabel: string, system: "iso" | "canada"): string {
  if (locale === "fr") {
    const systemLabel = system === "iso" ? "ISO 8601" : "dim.–sam.";
    return `${geoLabel} ${year} : semaines et fériés (${systemLabel})`;
  }
  const systemLabel = system === "iso" ? "ISO 8601" : "Sun–Sat";
  return `${geoLabel} ${year} week calendar (${systemLabel})`;
}

export function homeCalendarDescription(
  locale: Locale,
  year: number,
  geoLabel: string,
  system: "iso" | "canada",
): string {
  if (locale === "fr") {
    return `Semaines ${system === "iso" ? "ISO 8601" : "Canada (dim–sam)"} pour ${geoLabel}, année ${year}. Numéro de semaine actuel, jours fériés canadiens et longs week-ends—idéal pour organiser travail, école et congés.`;
  }
  return `${system === "iso" ? "ISO 8601" : "Canada (Sun–Sat)"} week numbers for ${geoLabel}, ${year}. Current week, Canadian holidays, and long weekends—plan work, school, and time off with confidence.`;
}

export function buildLocaleAlternates(path: string) {
  return {
    canonical: `https://whatweek.ca/en${path}`,
    languages: {
      "en-CA": `https://whatweek.ca/en${path}`,
      "fr-CA": `https://whatweek.ca/fr${path}`,
      "x-default": `https://whatweek.ca/en${path}`,
    },
  } as const;
}

export function buildFaqJsonLd(
  entries: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

/**
 * Build a BreadcrumbList JSON-LD object from an ordered list of crumbs.
 * Each crumb has a `name` (display label) and a `path` (path WITHOUT locale prefix).
 * The locale prefix is prepended automatically.
 *
 * The final crumb in the list is the current page.
 */
export function buildBreadcrumbJsonLd(
  locale: "en" | "fr",
  crumbs: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  const BASE = "https://whatweek.ca";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "fr" ? "Accueil" : "Home",
        item: `${BASE}/${locale}`,
      },
      ...crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.name,
        item: `${BASE}/${locale}${crumb.path}`,
      })),
    ],
  };
}

/**
 * Build a WebPage JSON-LD object.
 */
export function buildWebPageJsonLd(options: {
  locale: Locale;
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  isSpeakable?: boolean;
}) {
  return {
    "@type": "WebPage",
    "@id": `${options.url}/#webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    inLanguage: options.locale === "fr" ? "fr-CA" : "en-CA",
    ...(options.datePublished ? { datePublished: options.datePublished } : {}),
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
    ...(options.isSpeakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".heroLead"],
          },
        }
      : {}),
    isPartOf: {
      "@id": `https://whatweek.ca/${options.locale}/#website`,
    },
  };
}

/**
 * Build a WebApplication JSON-LD object for tool-based pages.
 */
export function buildWebApplicationJsonLd(options: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}): Record<string, unknown> {
  return {
    "@type": "WebApplication",
    "@id": `${options.url}/#software`,
    name: options.name,
    description: options.description,
    url: options.url,
    applicationCategory: options.applicationCategory || "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
