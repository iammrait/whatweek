import { NextResponse } from "next/server";
import { checkApiAccess, rateLimitHeaders, rateLimitResponse } from "@/lib/api-keys";
import { getHolidaysForDateRange, getNextLongWeekend } from "@/lib/holidays-ca";
import {
  defaultCanadaTimeZone,
  getProvinceTimeZone,
  isProvinceCode,
  type ProvinceCode,
} from "@/lib/provinces";
import {
  formatDateLong,
  getCanadaWeekNumber,
  getCanadaWeekYear,
  getIsoWeekNumber,
  getIsoWeekYear,
  getTodayInTimeZone,
  getWeeksInIsoYear,
  startOfCanadaWeek,
  startOfIsoWeek,
} from "@/lib/week";

export const revalidate = 1800;

function parseDate(input: string | null): Date | null {
  if (!input) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [y, m, d] = input.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

function parseProvince(input: string | null): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const access = checkApiAccess(request);
  if (!access.allowed) return rateLimitResponse(access);

  const url = new URL(request.url);
  const province = parseProvince(url.searchParams.get("province"));
  const localeParam = url.searchParams.get("locale");
  const locale = localeParam === "fr" ? "fr-CA" : "en-CA";
  const timeZone = getProvinceTimeZone(province) ?? defaultCanadaTimeZone;
  const queryDate = parseDate(url.searchParams.get("date"));
  const target = queryDate ?? getTodayInTimeZone(timeZone);

  const isoWeek = getIsoWeekNumber(target);
  const isoYear = getIsoWeekYear(target);
  const canadaWeek = getCanadaWeekNumber(target);
  const canadaYear = getCanadaWeekYear(target);
  const isoStart = startOfIsoWeek(target);
  const isoEnd = new Date(isoStart);
  isoEnd.setUTCDate(isoStart.getUTCDate() + 6);
  const canadaStart = startOfCanadaWeek(target);
  const canadaEnd = new Date(canadaStart);
  canadaEnd.setUTCDate(canadaStart.getUTCDate() + 6);
  const dayOfYear =
    Math.floor((target.getTime() - Date.UTC(target.getUTCFullYear(), 0, 1, 12, 0, 0)) / 86_400_000) + 1;
  const weeksInYear = getWeeksInIsoYear(target.getUTCFullYear());
  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(target);

  const [holidays, longWeekend] = await Promise.all([
    getHolidaysForDateRange(canadaStart, canadaEnd, province),
    getNextLongWeekend(target.getUTCFullYear(), target, province),
  ]);

  const payload = {
    date: ymd(target),
    weekday,
    timeZone,
    province,
    iso: {
      week: isoWeek,
      year: isoYear,
      code: `${isoYear}-W${String(isoWeek).padStart(2, "0")}`,
      start: ymd(isoStart),
      end: ymd(isoEnd),
      startLong: formatDateLong(isoStart, locale),
      endLong: formatDateLong(isoEnd, locale),
    },
    canada: {
      week: canadaWeek,
      year: canadaYear,
      start: ymd(canadaStart),
      end: ymd(canadaEnd),
      startLong: formatDateLong(canadaStart, locale),
      endLong: formatDateLong(canadaEnd, locale),
    },
    dayOfYear,
    weeksInYear,
    holidays: holidays.map((holiday) => ({
      date: ymd(holiday.date),
      nameEn: holiday.nameEn,
      nameFr: holiday.nameFr,
      global: holiday.global ?? false,
    })),
    longWeekend: longWeekend
      ? {
          labelEn: longWeekend.labelEn,
          labelFr: longWeekend.labelFr,
          start: ymd(longWeekend.start),
          end: ymd(longWeekend.end),
        }
      : null,
    source: "https://whatweek.ca",
    docs: "https://whatweek.ca/en/llms.txt",
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      ...rateLimitHeaders(access),
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
