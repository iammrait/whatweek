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
  title: "WhatWeek.ca month embed",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ province?: string; system?: string }>;
};

function parseProvince(input: string | undefined): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

const isoWeekdayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
const canadaWeekdayOrder = [0, 1, 2, 3, 4, 5, 6]; // Sun..Sat

export default async function EmbedMonth({ params, searchParams }: Props) {
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
  const year = today.getUTCFullYear();
  const monthIndex = today.getUTCMonth();
  const todayKey = `${year}-${monthIndex}-${today.getUTCDate()}`;

  const yearCal = getYearCalendar(year, today, system);
  const month = yearCal[monthIndex];

  const monthLabel = new Intl.DateTimeFormat(localeCode, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(today);

  const weekdayOrder = system === "iso" ? isoWeekdayOrder : canadaWeekdayOrder;
  const weekdayLabels = weekdayOrder.map((dow) => {
    const ref = new Date(Date.UTC(2024, 0, 7 + dow, 12, 0, 0)); // 2024-01-07 was a Sunday
    return new Intl.DateTimeFormat(localeCode, { weekday: "narrow", timeZone: "UTC" }).format(ref);
  });
  const weekColLabel = isFr ? "Sem." : "Wk";
  const homeHref = `https://whatweek.ca/${locale}`;

  return (
    <main id="main-content" className="embedWidget embedMonth">
      <div className="embedMonthHeader">
        <strong className="embedMonthTitle">{monthLabel}</strong>
        <span className="embedMonthSystem">
          {system === "iso" ? "ISO" : "Canada"}
        </span>
      </div>
      <table className="embedMonthGrid" aria-label={monthLabel}>
        <thead>
          <tr>
            <th scope="col" className="embedMonthWk">
              {weekColLabel}
            </th>
            {weekdayLabels.map((label, i) => (
              <th key={i} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week) => (
            <tr key={week.weekNumber + "-" + week.days[0].date.toISOString()}>
              <th scope="row" className="embedMonthWk">
                {week.weekNumber}
              </th>
              {week.days.map((day) => {
                const dKey = `${day.date.getUTCFullYear()}-${day.date.getUTCMonth()}-${day.date.getUTCDate()}`;
                const isToday = dKey === todayKey;
                const className = [
                  !day.inMonth ? "embedMonthOut" : "",
                  isToday ? "embedMonthToday" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <td key={dKey} className={className || undefined}>
                    {day.dayOfMonth}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="embedBrand">
        <a href={homeHref} target="_blank" rel="noopener noreferrer">
          {isFr ? "whatweek.ca — calendrier du mois" : "whatweek.ca — month calendar"}
        </a>
      </div>
    </main>
  );
}
