import { NextResponse } from "next/server";
import { checkApiAccess, rateLimitHeaders, rateLimitResponse } from "@/lib/api-keys";
import { getHolidaysForYearByProvince, getLongWeekendsForYear } from "@/lib/holidays-ca";
import {
  isProvinceCode,
  provinceCodes,
  provinceNames,
  type ProvinceCode,
} from "@/lib/provinces";
import { getIsoWeekNumber } from "@/lib/week";

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

function ymd(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const access = checkApiAccess(request);
  if (!access.allowed) return rateLimitResponse(access);

  const url = new URL(request.url);
  const today = new Date();
  const year = parseYear(url.searchParams.get("year"), today.getUTCFullYear());
  const province = parseProvince(url.searchParams.get("province"));
  const includeLongWeekends = url.searchParams.get("longWeekends") === "1";

  const holidays = await getHolidaysForYearByProvince(year, province);

  const provincesPayload = province
    ? [
        {
          code: province,
          slug: province.replace("CA-", "").toLowerCase(),
          nameEn: provinceNames[province].en,
          nameFr: provinceNames[province].fr,
        },
      ]
    : provinceCodes.map((code) => ({
        code,
        slug: code.replace("CA-", "").toLowerCase(),
        nameEn: provinceNames[code].en,
        nameFr: provinceNames[code].fr,
      }));

  const payload: Record<string, unknown> = {
    year,
    province: province
      ? { code: province, nameEn: provinceNames[province].en, nameFr: provinceNames[province].fr }
      : null,
    count: holidays.length,
    holidays: holidays.map((holiday) => ({
      date: ymd(holiday.date),
      nameEn: holiday.nameEn,
      nameFr: holiday.nameFr,
      global: holiday.global ?? false,
      counties: holiday.counties ?? null,
      isoWeek: getIsoWeekNumber(holiday.date),
    })),
    provinces: provincesPayload,
    source: {
      site: "https://whatweek.ca",
      data: "https://date.nager.at",
      docs: "https://whatweek.ca/en/api-docs",
    },
  };

  if (includeLongWeekends) {
    const lw = await getLongWeekendsForYear(year, province);
    payload.longWeekends = lw.map((weekend) => ({
      labelEn: weekend.labelEn,
      labelFr: weekend.labelFr,
      start: ymd(weekend.start),
      end: ymd(weekend.end),
    }));
  }

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
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
