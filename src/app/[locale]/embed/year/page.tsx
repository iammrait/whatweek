import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import {
  defaultCanadaTimeZone,
  getProvinceTimeZone,
  isProvinceCode,
  type ProvinceCode,
} from "@/lib/provinces";
import {
  getTodayInTimeZone,
  getWeekSystem,
  getYearCalendar,
  type WeekSystem,
} from "@/lib/week";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "WhatWeek.ca year embed",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ province?: string; system?: string; year?: string }>;
};

function parseProvince(input: string | undefined): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

function parseYear(input: string | undefined, fallback: number): number {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1900 || value > 2100) return fallback;
  return value;
}

export default async function EmbedYear({ params, searchParams }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const query = await searchParams;
  const province = parseProvince(query.province);
  const system: WeekSystem = getWeekSystem(query.system);

  const timeZone = province ? getProvinceTimeZone(province) : defaultCanadaTimeZone;
  const today = getTodayInTimeZone(timeZone);
  const defaultYear = today.getUTCFullYear();
  const year = parseYear(query.year, defaultYear);

  const yearCal = getYearCalendar(year, today, system);
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(localeCode, { month: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(year, i, 15, 12, 0, 0)),
    ),
  );
  const homeHref = `https://whatweek.ca/${locale}`;

  return (
    <main id="main-content" className="embedWidget embedYear">
      <div className="embedYearHeader">
        <strong className="embedYearTitle">{year}</strong>
        <span className="embedYearSystem">
          {system === "iso" ? "ISO" : "Canada"}
        </span>
      </div>
      <div className="embedYearGrid">
        {yearCal.map((month) => (
          <div key={month.monthIndex} className="embedYearMonth">
            <div className="embedYearMonthLabel">{monthLabels[month.monthIndex]}</div>
            <ul className="embedYearWeekList">
              {month.weeks
                .filter((week) => week.days.some((d) => d.inMonth))
                .map((week, i) => (
                  <li
                    key={`${month.monthIndex}-${week.weekNumber}-${i}`}
                    className={week.isCurrentWeek ? "embedYearCurrent" : undefined}
                  >
                    {week.weekNumber}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="embedBrand">
        <a href={homeHref} target="_blank" rel="noopener noreferrer">
          {isFr ? "whatweek.ca — semaines de l'année" : "whatweek.ca — year week numbers"}
        </a>
      </div>
    </main>
  );
}
