import { NextResponse } from "next/server";
import { getHolidaysForYearByProvince } from "@/lib/holidays-ca";
import { buildHolidaysIcs } from "@/lib/ics";
import { isProvinceCode, type ProvinceCode } from "@/lib/provinces";
import { isLocale, type Locale } from "@/lib/i18n";

export const revalidate = 86_400;

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function parseYear(input: string | null, fallback: number): number {
  const value = Number(input);
  if (!Number.isFinite(value)) return fallback;
  const integer = Math.trunc(value);
  if (integer < MIN_YEAR || integer > MAX_YEAR) return fallback;
  return integer;
}

function parseProvince(input: string | null): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

function parseLocale(input: string | null): Locale {
  if (input && isLocale(input)) return input;
  return "en";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const today = new Date();
  const year = parseYear(url.searchParams.get("year"), today.getUTCFullYear());
  const province = parseProvince(url.searchParams.get("province"));
  const locale = parseLocale(url.searchParams.get("locale"));

  const holidays = await getHolidaysForYearByProvince(year, province);
  const ics = buildHolidaysIcs({ holidays, province, year, locale });

  const filename = `whatweek-holidays-${province ?? "CA"}-${year}.ics`;
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
