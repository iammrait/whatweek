"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { formatDateLong, getWeeksInIsoYear } from "@/lib/week";
import { getIsoWeekPeriodStart } from "@/lib/seo-metadata";

type Props = {
  locale: Locale;
  defaultYear: number;
  defaultWeek: number;
};

export function IsoWeekToDateForm({ locale, defaultYear, defaultWeek }: Props) {
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const [yearValue, setYearValue] = useState(String(defaultYear));
  const [weekValue, setWeekValue] = useState(String(defaultWeek));

  const result = useMemo(() => {
    const year = Number(yearValue);
    const week = Number(weekValue);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) return null;
    if (!Number.isInteger(week) || week < 1) return null;
    const maxWeek = getWeeksInIsoYear(year);
    if (week > maxWeek) {
      return { error: isFr ? `${year} ne contient que ${maxWeek} semaines ISO.` : `${year} only has ${maxWeek} ISO weeks.` };
    }
    const start = getIsoWeekPeriodStart(year, week);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      return {
        long: formatDateLong(d, localeCode),
        weekday: new Intl.DateTimeFormat(localeCode, { weekday: "long", timeZone: "UTC" }).format(d),
        iso: d.toISOString().slice(0, 10),
      };
    });
    return {
      isoCode: `${year}-W${String(week).padStart(2, "0")}`,
      startLong: formatDateLong(start, localeCode),
      endLong: formatDateLong(end, localeCode),
      maxWeek,
      year,
      week,
      days,
      detailHref: `/${locale}/week/${year}/${week}`,
    };
  }, [yearValue, weekValue, localeCode, isFr, locale]);

  return (
    <div className="converterCard">
      <div className="converterPanel">
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="iwd-year">{isFr ? "Année ISO" : "ISO year"}</label>
            <input id="iwd-year" className="converterInput" type="number" min={1900} max={2100} value={yearValue} onChange={(e) => setYearValue(e.target.value)} />
          </div>
          <div>
            <label className="converterLabel" htmlFor="iwd-week">{isFr ? "Numéro de semaine" : "Week number"}</label>
            <input id="iwd-week" className="converterInput" type="number" min={1} max={53} value={weekValue} onChange={(e) => setWeekValue(e.target.value)} />
          </div>
        </div>

        {result && "error" in result ? (
          <p className="converterError">{result.error}</p>
        ) : result ? (
          <>
            <dl className="converterResults">
              <div>
                <dt>{isFr ? "Code ISO" : "ISO code"}</dt>
                <dd><strong>{result.isoCode}</strong></dd>
              </div>
              <div>
                <dt>{isFr ? "Lundi (début)" : "Monday (start)"}</dt>
                <dd>{result.startLong}</dd>
              </div>
              <div>
                <dt>{isFr ? "Dimanche (fin)" : "Sunday (end)"}</dt>
                <dd>{result.endLong}</dd>
              </div>
              <div>
                <dt>{isFr ? "Total semaines en" : "Total weeks in"} {result.year}</dt>
                <dd>{result.maxWeek}</dd>
              </div>
            </dl>

            <table className="holidayTable">
              <thead>
                <tr>
                  <th>{isFr ? "Jour" : "Weekday"}</th>
                  <th>{isFr ? "Date" : "Date"}</th>
                  <th>ISO</th>
                </tr>
              </thead>
              <tbody>
                {result.days.map((day) => (
                  <tr key={day.iso}>
                    <td>{day.weekday}</td>
                    <td>{day.long}</td>
                    <td>{day.iso}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p>
              <Link href={result.detailHref} prefetch={false}>
                {isFr ? "Voir la page détail de cette semaine →" : "Open this week's detail page →"}
              </Link>
            </p>
          </>
        ) : (
          <p className="converterError">{isFr ? "Entrée invalide." : "Invalid input."}</p>
        )}
      </div>
    </div>
  );
}
