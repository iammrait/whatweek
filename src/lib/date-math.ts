import type { Locale } from "@/lib/i18n";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse a YYYY-MM-DD string into a UTC noon Date, or null if invalid. */
export function parseIsoDate(input: string | null | undefined): Date | null {
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [y, m, d] = input.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

/** Format a Date as YYYY-MM-DD using its UTC fields. */
export function ymd(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function utcMidday(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

export function diffInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

export function diffInWeeks(a: Date, b: Date): number {
  return diffInDays(a, b) / 7;
}

export function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, Math.trunc(weeks) * 7);
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/** Inclusive day-of-year (Jan 1 = 1). */
export function dayOfYear(date: Date): number {
  const start = utcMidday(date.getUTCFullYear(), 0, 1);
  return diffInDays(date, start) + 1;
}

export type PopularDate = {
  slug: string;
  /** ISO month-day; year is the *current* year unless `fixedYear` is set. */
  monthDay: string;
  fixedYear?: number;
  labelEn: string;
  labelFr: string;
};

/**
 * High-volume Canadian "days until" countdown targets. Used to pre-render
 * static popular pages and to fill the popular-dates rail.
 */
export const popularCanadianDates: PopularDate[] = [
  { slug: "new-years-day", monthDay: "01-01", labelEn: "New Year's Day", labelFr: "Jour de l'An" },
  { slug: "family-day", monthDay: "02-16", labelEn: "Family Day (third Monday in February)", labelFr: "Jour de la famille" },
  { slug: "valentines-day", monthDay: "02-14", labelEn: "Valentine's Day", labelFr: "Saint-Valentin" },
  { slug: "saint-patricks-day", monthDay: "03-17", labelEn: "Saint Patrick's Day", labelFr: "Saint-Patrick" },
  { slug: "good-friday", monthDay: "04-03", labelEn: "Good Friday", labelFr: "Vendredi saint" },
  { slug: "easter-sunday", monthDay: "04-05", labelEn: "Easter Sunday", labelFr: "Pâques" },
  { slug: "earth-day", monthDay: "04-22", labelEn: "Earth Day", labelFr: "Jour de la Terre" },
  { slug: "victoria-day", monthDay: "05-18", labelEn: "Victoria Day", labelFr: "Fête de la Reine" },
  { slug: "mothers-day", monthDay: "05-10", labelEn: "Mother's Day", labelFr: "Fête des mères" },
  { slug: "fathers-day", monthDay: "06-21", labelEn: "Father's Day", labelFr: "Fête des pères" },
  { slug: "saint-jean-baptiste", monthDay: "06-24", labelEn: "Saint-Jean-Baptiste Day", labelFr: "Fête nationale du Québec" },
  { slug: "canada-day", monthDay: "07-01", labelEn: "Canada Day", labelFr: "Fête du Canada" },
  { slug: "civic-holiday", monthDay: "08-03", labelEn: "Civic Holiday", labelFr: "Congé civique" },
  { slug: "labour-day", monthDay: "09-07", labelEn: "Labour Day", labelFr: "Fête du Travail" },
  { slug: "truth-and-reconciliation", monthDay: "09-30", labelEn: "National Day for Truth and Reconciliation", labelFr: "Journée nationale de la vérité et de la réconciliation" },
  { slug: "thanksgiving", monthDay: "10-12", labelEn: "Canadian Thanksgiving", labelFr: "Action de grâce" },
  { slug: "halloween", monthDay: "10-31", labelEn: "Halloween", labelFr: "Halloween" },
  { slug: "remembrance-day", monthDay: "11-11", labelEn: "Remembrance Day", labelFr: "Jour du Souvenir" },
  { slug: "black-friday", monthDay: "11-27", labelEn: "Black Friday", labelFr: "Vendredi fou" },
  { slug: "christmas-day", monthDay: "12-25", labelEn: "Christmas Day", labelFr: "Noël" },
  { slug: "boxing-day", monthDay: "12-26", labelEn: "Boxing Day", labelFr: "Lendemain de Noël" },
  { slug: "new-years-eve", monthDay: "12-31", labelEn: "New Year's Eve", labelFr: "Veille du Nouvel An" },
];

/** Resolve a popular date for the next occurrence on/after `today`. */
export function resolvePopularDate(entry: PopularDate, today: Date): Date {
  const [m, d] = entry.monthDay.split("-").map(Number);
  if (entry.fixedYear) return utcMidday(entry.fixedYear, m - 1, d);
  const thisYear = utcMidday(today.getUTCFullYear(), m - 1, d);
  if (thisYear.getTime() >= today.getTime()) return thisYear;
  return utcMidday(today.getUTCFullYear() + 1, m - 1, d);
}

/** Slug-safe YYYY-MM-DD route segment matcher. */
export function isDateSlug(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Format a date using Intl.DateTimeFormat with sensible defaults for this site. */
export function formatLong(date: Date, locale: Locale): string {
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  return new Intl.DateTimeFormat(localeCode, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShort(date: Date, locale: Locale): string {
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  return new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
