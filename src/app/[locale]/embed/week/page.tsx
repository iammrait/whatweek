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
  getCanadaWeekNumber,
  getIsoWeekNumber,
  getIsoWeekYear,
  getTodayInTimeZone,
  startOfIsoWeek,
} from "@/lib/week";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "WhatWeek.ca embed",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ province?: string }>;
};

function parseProvince(input: string | undefined): ProvinceCode | null {
  if (!input) return null;
  const upper = input.toUpperCase();
  const candidate = upper.startsWith("CA-") ? upper : `CA-${upper}`;
  return isProvinceCode(candidate) ? candidate : null;
}

export default async function EmbedWeek({ params, searchParams }: Props) {
  const { locale: localeInput } = await params;
  if (!isLocale(localeInput)) notFound();
  const locale: Locale = localeInput;
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const query = await searchParams;
  const province = parseProvince(query.province);

  const timeZone = province ? getProvinceTimeZone(province) : defaultCanadaTimeZone;
  const today = getTodayInTimeZone(timeZone);
  const isoWeek = getIsoWeekNumber(today);
  const isoYear = getIsoWeekYear(today);
  const canadaWeek = getCanadaWeekNumber(today);
  const start = startOfIsoWeek(today);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const dateLabel = new Intl.DateTimeFormat(localeCode, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const range = `${dateLabel.format(start)} – ${dateLabel.format(end)}`;
  const homeHref = `https://whatweek.ca/${locale}`;

  return (
    <main className="embedWidget">
      <div className="embedWeek" aria-label={isFr ? "Numéro de semaine" : "Week number"}>
        W{isoWeek}
      </div>
      <div className="embedMeta">
        {isFr
          ? `Semaine ${isoWeek} de ${isoYear} · ${range}`
          : `Week ${isoWeek} of ${isoYear} · ${range}`}
      </div>
      <div className="embedMeta">
        {isFr ? `Canada (dim–sam) : semaine ${canadaWeek}` : `Canada (Sun–Sat): week ${canadaWeek}`}
      </div>
      <div className="embedBrand">
        <a href={homeHref} target="_blank" rel="noopener noreferrer">
          {isFr ? "whatweek.ca — semaines au Canada" : "whatweek.ca — Canada week numbers"}
        </a>
      </div>
    </main>
  );
}
