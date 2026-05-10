import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import {
  defaultCanadaTimeZone,
  getProvinceTimeZone,
  isProvinceCode,
  provinceNames,
  type ProvinceCode,
} from "@/lib/provinces";
import { getHolidaysForYearByProvince } from "@/lib/holidays-ca";
import { getTodayInTimeZone } from "@/lib/week";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "WhatWeek.ca holidays embed",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ province?: string; year?: string; limit?: string }>;
};

function parseProvince(input: string | undefined): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

function parseYear(input: string | undefined, fallback: number): number {
  const v = Number(input);
  if (!Number.isInteger(v) || v < 1900 || v > 2100) return fallback;
  return v;
}

function parseLimit(input: string | undefined, fallback: number): number {
  const v = Number(input);
  if (!Number.isInteger(v) || v < 1 || v > 30) return fallback;
  return v;
}

export default async function EmbedHolidays({ params, searchParams }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const query = await searchParams;
  const province = parseProvince(query.province);

  const timeZone = province ? getProvinceTimeZone(province) : defaultCanadaTimeZone;
  const today = getTodayInTimeZone(timeZone);
  const year = parseYear(query.year, today.getUTCFullYear());
  const limit = parseLimit(query.limit, 6);

  const holidays = await getHolidaysForYearByProvince(year, province);
  const upcoming = holidays.filter((h) => h.date.getTime() >= today.getTime()).slice(0, limit);
  const visible = upcoming.length > 0 ? upcoming : holidays.slice(-limit);

  const dateLabel = new Intl.DateTimeFormat(localeCode, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const geoLabel = province ? provinceNames[province][locale] : isFr ? "Canada (fédéral)" : "Canada (federal)";
  const homeHref = `https://whatweek.ca/${locale}/long-weekends/${year}${province ? `?province=${province.replace("CA-", "").toLowerCase()}` : ""}`;

  return (
    <main className="embedWidget">
      <div className="embedMonthHeader">
        <strong className="embedMonthTitle">
          {isFr ? "Prochains jours fériés" : "Upcoming holidays"}
        </strong>
        <span className="embedMonthSystem">{geoLabel}</span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
        {visible.map((holiday) => (
          <li key={holiday.date.toISOString()} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
            <span>{isFr ? holiday.nameFr : holiday.nameEn}</span>
            <span className="subtle" style={{ marginTop: 0, fontVariantNumeric: "tabular-nums" }}>
              {dateLabel.format(holiday.date)}
            </span>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="subtle" style={{ marginTop: 0 }}>{isFr ? "Aucun jour férié" : "No holidays found"}</li>
        )}
      </ul>

      <div className="embedBrand" style={{ marginTop: "0.6rem" }}>
        <a href={homeHref} target="_blank" rel="noopener noreferrer">
          {isFr ? `whatweek.ca — fériés ${year}` : `whatweek.ca — ${year} holidays`}
        </a>
      </div>
    </main>
  );
}
