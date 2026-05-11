import { stat } from "node:fs/promises";
import path from "node:path";
import { keywordPageOrder } from "@/lib/keyword-targets";

type Locale = "en" | "fr";

type RouteKind =
  | "home"
  | "currentWeek"
  | "isoWeek"
  | "about"
  | "privacy"
  | "keyword"
  | "calendarYear"
  | "weekYear"
  | "dateToWeek"
  | "businessDays"
  | "payPeriod"
  | "addWeeks"
  | "subtractWeeks"
  | "isoToDate"
  | "pregnancy"
  | "longWeekends"
  | "statutoryHolidays"
  | "schoolYear"
  | "payCalendar"
  | "dayOfYearYear"
  | "weeksInYearRoot"
  | "timezones"
  | "apiKeys";

const sourceLastmodCache = new Map<RouteKind, string | undefined>();

function formatDateOnlyUtc(value: Date): string | undefined {
  if (!Number.isFinite(value.getTime())) {
    return undefined;
  }
  const yyyyMmDd = value.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd) ? yyyyMmDd : undefined;
}

async function getSourceLastmod(kind: RouteKind): Promise<string | undefined> {
  if (sourceLastmodCache.has(kind)) {
    return sourceLastmodCache.get(kind);
  }

  const filePath = getSourcePathForKind(kind);
  try {
    const fileStat = await stat(filePath);
    const lastmod = formatDateOnlyUtc(fileStat.mtime);
    sourceLastmodCache.set(kind, lastmod);
    return lastmod;
  } catch {
    sourceLastmodCache.set(kind, undefined);
    return undefined;
  }
}

function getSourcePathForKind(kind: RouteKind): string {
  switch (kind) {
    case "home":
      return path.join(process.cwd(), "src/app/[locale]/page.tsx");
    case "currentWeek":
      return path.join(process.cwd(), "src/app/[locale]/current-week-number-canada/page.tsx");
    case "isoWeek":
      return path.join(process.cwd(), "src/app/[locale]/iso-week-number-canada/page.tsx");
    case "about":
      return path.join(process.cwd(), "src/app/[locale]/about/page.tsx");
    case "privacy":
      return path.join(process.cwd(), "src/app/[locale]/privacy/page.tsx");
    case "keyword":
      return path.join(process.cwd(), "src/app/[locale]/[keywordSlug]/page.tsx");
    case "calendarYear":
      return path.join(process.cwd(), "src/app/[locale]/calendar/[year]/page.tsx");
    case "weekYear":
      return path.join(process.cwd(), "src/app/[locale]/week/[year]/[week]/page.tsx");
    case "dateToWeek":
      return path.join(process.cwd(), "src/app/[locale]/date-to-week/page.tsx");
    case "businessDays":
      return path.join(process.cwd(), "src/app/[locale]/business-days-calculator/page.tsx");
    case "payPeriod":
      return path.join(process.cwd(), "src/app/[locale]/pay-period-calculator/page.tsx");
    case "addWeeks":
      return path.join(process.cwd(), "src/app/[locale]/add-weeks/page.tsx");
    case "subtractWeeks":
      return path.join(process.cwd(), "src/app/[locale]/subtract-weeks/page.tsx");
    case "isoToDate":
      return path.join(process.cwd(), "src/app/[locale]/iso-week-to-date/page.tsx");
    case "pregnancy":
      return path.join(process.cwd(), "src/app/[locale]/pregnancy-week-calculator/page.tsx");
    case "longWeekends":
      return path.join(process.cwd(), "src/app/[locale]/long-weekends/[year]/page.tsx");
    case "statutoryHolidays":
      return path.join(process.cwd(), "src/app/[locale]/statutory-holidays/[province]/[year]/page.tsx");
    case "schoolYear":
      return path.join(process.cwd(), "src/app/[locale]/school-year/[province]/[startYear]/page.tsx");
    case "payCalendar":
      return path.join(process.cwd(), "src/app/[locale]/pay-calendar/[year]/page.tsx");
    case "dayOfYearYear":
      return path.join(process.cwd(), "src/app/[locale]/day-of-year/[year]/page.tsx");
    case "weeksInYearRoot":
      return path.join(process.cwd(), "src/app/[locale]/weeks-in/[year]/page.tsx");
    case "timezones":
      return path.join(process.cwd(), "src/app/[locale]/timezones/page.tsx");
    case "apiKeys":
      return path.join(process.cwd(), "src/app/[locale]/api-keys/page.tsx");
    default: {
      const unreachable: never = kind;
      throw new Error(`Unhandled route kind: ${unreachable}`);
    }
  }
}

function getKindFromPath(pathWithoutLocale: string): RouteKind | undefined {
  if (pathWithoutLocale === "" || pathWithoutLocale === "/") return "home";
  if (pathWithoutLocale === "/current-week-number-canada") return "currentWeek";
  if (pathWithoutLocale === "/iso-week-number-canada") return "isoWeek";
  if (pathWithoutLocale === "/about") return "about";
  if (pathWithoutLocale === "/privacy") return "privacy";
  if (pathWithoutLocale === "/date-to-week") return "dateToWeek";
  if (pathWithoutLocale === "/business-days-calculator") return "businessDays";
  if (pathWithoutLocale === "/pay-period-calculator") return "payPeriod";
  if (pathWithoutLocale === "/add-weeks") return "addWeeks";
  if (pathWithoutLocale === "/subtract-weeks") return "subtractWeeks";
  if (pathWithoutLocale === "/iso-week-to-date") return "isoToDate";
  if (pathWithoutLocale === "/pregnancy-week-calculator") return "pregnancy";
  if (pathWithoutLocale === "/timezones") return "timezones";
  if (pathWithoutLocale === "/api-keys") return "apiKeys";
  
  if (/^\/calendar\/\d{4}$/.test(pathWithoutLocale)) return "calendarYear";
  if (/^\/week\/\d{4}\/\d{1,2}$/.test(pathWithoutLocale)) return "weekYear";
  if (/^\/long-weekends\/\d{4}$/.test(pathWithoutLocale)) return "longWeekends";
  if (/^\/statutory-holidays\/[a-z]{2}\/\d{4}$/.test(pathWithoutLocale)) return "statutoryHolidays";
  if (/^\/school-year\/[a-z]{2}\/\d{4}$/.test(pathWithoutLocale)) return "schoolYear";
  if (/^\/pay-calendar\/\d{4}$/.test(pathWithoutLocale)) return "payCalendar";
  if (/^\/day-of-year\/\d{4}$/.test(pathWithoutLocale)) return "dayOfYearYear";
  if (/^\/weeks-in\/\d{4}$/.test(pathWithoutLocale)) return "weeksInYearRoot";
  if (/^\/timezones\/[a-z]+$/.test(pathWithoutLocale)) return "timezones";

  if (keywordPageOrder.some((slug) => pathWithoutLocale === `/${slug}`)) {
    return "keyword";
  }
  return undefined;
}

export async function getSitemapLastmod(_locale: Locale, pathWithoutLocale: string): Promise<string | undefined> {
  const kind = getKindFromPath(pathWithoutLocale);
  if (!kind) return undefined;
  return getSourceLastmod(kind);
}
