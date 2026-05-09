import type { Holiday } from "@/lib/holidays-ca";
import { provinceNames, type ProvinceCode } from "@/lib/provinces";

const PROD_ID = "-//WhatWeek.ca//Canadian Holidays//EN";

function pad(value: number, width = 2) {
  return String(value).padStart(width, "0");
}

function toIcsDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function toIcsTimestamp(date: Date): string {
  return `${toIcsDate(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let cursor = 0;
  while (cursor < line.length) {
    const slice = line.slice(cursor, cursor + (cursor === 0 ? 75 : 74));
    out.push(cursor === 0 ? slice : ` ${slice}`);
    cursor += cursor === 0 ? 75 : 74;
  }
  return out.join("\r\n");
}

export type IcsCalendarOptions = {
  holidays: Holiday[];
  province: ProvinceCode | null;
  year: number;
  locale: "en" | "fr";
};

export function buildHolidaysIcs({ holidays, province, year, locale }: IcsCalendarOptions): string {
  const isFr = locale === "fr";
  const geoLabel = province
    ? provinceNames[province][locale]
    : isFr
      ? "Canada (fédéral)"
      : "Canada (federal)";
  const calName = isFr
    ? `Jours fériés — ${geoLabel} ${year}`
    : `Statutory holidays — ${geoLabel} ${year}`;
  const calDescription = isFr
    ? `Jours fériés au Canada pour ${geoLabel} en ${year}. Source : whatweek.ca / Nager.Date.`
    : `Canadian statutory holidays for ${geoLabel} in ${year}. Source: whatweek.ca / Nager.Date.`;
  const dtstamp = toIcsTimestamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PROD_ID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calName)}`,
    `X-WR-CALDESC:${escapeText(calDescription)}`,
    "X-WR-TIMEZONE:America/Toronto",
  ];

  for (const holiday of holidays) {
    const start = holiday.date;
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);
    const summary = isFr ? holiday.nameFr : holiday.nameEn;
    const uid = `${toIcsDate(start)}-${escapeText(holiday.nameEn).replace(/\W+/g, "")}-${province ?? "CA"}@whatweek.ca`;
    const description = isFr
      ? `Jour férié ${province ? `pour ${geoLabel}` : "fédéral au Canada"}. Plus d’infos : https://whatweek.ca/fr`
      : `Statutory holiday ${province ? `for ${geoLabel}` : "across Canada"}. More info: https://whatweek.ca/en`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
      `DTEND;VALUE=DATE:${toIcsDate(end)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map((line) => foldLine(line)).join("\r\n");
}
