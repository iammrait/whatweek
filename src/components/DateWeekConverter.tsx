"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  getCanadaWeekNumber,
  getCanadaWeekYear,
  getIsoWeekNumber,
  getIsoWeekYear,
  getWeeksInIsoYear,
  startOfCanadaWeek,
  startOfIsoWeek,
  formatDateLong,
} from "@/lib/week";
import { getIsoWeekPeriodStart } from "@/lib/seo-metadata";

type Props = {
  locale: Locale;
  defaultDate: string;
  defaultYear: number;
  defaultWeek: number;
};

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

function formatRange(start: Date, end: Date, localeCode: string) {
  return `${formatDateLong(start, localeCode)} – ${formatDateLong(end, localeCode)}`;
}

export function DateWeekConverter({ locale, defaultDate, defaultYear, defaultWeek }: Props) {
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const [mode, setMode] = useState<"date" | "week">("date");
  const [dateValue, setDateValue] = useState(defaultDate);
  const [yearValue, setYearValue] = useState(String(defaultYear));
  const [weekValue, setWeekValue] = useState(String(defaultWeek));

  const dateResult = useMemo(() => {
    const date = parseDateInput(dateValue);
    if (!date) return null;
    const isoWeek = getIsoWeekNumber(date);
    const isoYear = getIsoWeekYear(date);
    const canadaWeek = getCanadaWeekNumber(date);
    const canadaYear = getCanadaWeekYear(date);
    const isoStart = startOfIsoWeek(date);
    const isoEnd = new Date(isoStart);
    isoEnd.setUTCDate(isoStart.getUTCDate() + 6);
    const canadaStart = startOfCanadaWeek(date);
    const canadaEnd = new Date(canadaStart);
    canadaEnd.setUTCDate(canadaStart.getUTCDate() + 6);
    const dayOfYear =
      Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1, 12, 0, 0)) / 86_400_000) +
      1;
    const weekday = new Intl.DateTimeFormat(localeCode, {
      weekday: "long",
      timeZone: "UTC",
    }).format(date);
    return {
      isoWeek,
      isoYear,
      canadaWeek,
      canadaYear,
      isoRange: formatRange(isoStart, isoEnd, localeCode),
      canadaRange: formatRange(canadaStart, canadaEnd, localeCode),
      dayOfYear,
      weekday,
      isoCode: `${isoYear}-W${String(isoWeek).padStart(2, "0")}`,
    };
  }, [dateValue, localeCode]);

  const weekResult = useMemo(() => {
    const year = Number(yearValue);
    const week = Number(weekValue);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) return null;
    if (!Number.isInteger(week) || week < 1) return null;
    const maxWeek = getWeeksInIsoYear(year);
    if (week > maxWeek) return { error: isFr ? `${year} ne contient que ${maxWeek} semaines ISO.` : `${year} only has ${maxWeek} ISO weeks.` };
    const start = getIsoWeekPeriodStart(year, week);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    return {
      start: formatDateLong(start, localeCode),
      end: formatDateLong(end, localeCode),
      range: formatRange(start, end, localeCode),
      maxWeek,
      isoCode: `${year}-W${String(week).padStart(2, "0")}`,
      startIso: start.toISOString().slice(0, 10),
      endIso: end.toISOString().slice(0, 10),
    };
  }, [yearValue, weekValue, localeCode, isFr]);

  return (
    <div className="converterCard">
      <div className="converterTabs" role="tablist" aria-label={isFr ? "Mode de conversion" : "Conversion mode"}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "date"}
          className={mode === "date" ? "converterTabActive" : ""}
          onClick={() => setMode("date")}
        >
          {isFr ? "Date → Semaine" : "Date → Week"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "week"}
          className={mode === "week" ? "converterTabActive" : ""}
          onClick={() => setMode("week")}
        >
          {isFr ? "Semaine → Dates" : "Week → Dates"}
        </button>
      </div>

      {mode === "date" ? (
        <div className="converterPanel">
          <label className="converterLabel" htmlFor="dwc-date">
            {isFr ? "Choisissez une date" : "Pick a date"}
          </label>
          <input
            id="dwc-date"
            className="converterInput"
            type="date"
            value={dateValue}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(event) => setDateValue(event.target.value)}
          />

          {dateResult ? (
            <dl className="converterResults">
              <div>
                <dt>{isFr ? "Semaine ISO 8601" : "ISO 8601 week"}</dt>
                <dd>
                  <strong>{dateResult.isoCode}</strong>
                  <span className="converterMuted"> · {dateResult.isoRange}</span>
                </dd>
              </div>
              <div>
                <dt>{isFr ? "Semaine Canada (dim–sam)" : "Canada week (Sun–Sat)"}</dt>
                <dd>
                  <strong>
                    {isFr ? "Semaine" : "Week"} {dateResult.canadaWeek} ({dateResult.canadaYear})
                  </strong>
                  <span className="converterMuted"> · {dateResult.canadaRange}</span>
                </dd>
              </div>
              <div>
                <dt>{isFr ? "Jour de la semaine" : "Weekday"}</dt>
                <dd>{dateResult.weekday}</dd>
              </div>
              <div>
                <dt>{isFr ? "Jour de l’année" : "Day of year"}</dt>
                <dd>
                  {dateResult.dayOfYear} / {365 + (dateResult.canadaYear % 4 === 0 && (dateResult.canadaYear % 100 !== 0 || dateResult.canadaYear % 400 === 0) ? 1 : 0)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="converterError">{isFr ? "Date invalide." : "Invalid date."}</p>
          )}
        </div>
      ) : (
        <div className="converterPanel">
          <div className="converterRow">
            <div>
              <label className="converterLabel" htmlFor="dwc-year">
                {isFr ? "Année ISO" : "ISO year"}
              </label>
              <input
                id="dwc-year"
                className="converterInput"
                type="number"
                min={1900}
                max={2100}
                value={yearValue}
                onChange={(event) => setYearValue(event.target.value)}
              />
            </div>
            <div>
              <label className="converterLabel" htmlFor="dwc-week">
                {isFr ? "Numéro de semaine" : "Week number"}
              </label>
              <input
                id="dwc-week"
                className="converterInput"
                type="number"
                min={1}
                max={53}
                value={weekValue}
                onChange={(event) => setWeekValue(event.target.value)}
              />
            </div>
          </div>

          {weekResult && "error" in weekResult ? (
            <p className="converterError">{weekResult.error}</p>
          ) : weekResult ? (
            <dl className="converterResults">
              <div>
                <dt>{isFr ? "Code ISO" : "ISO code"}</dt>
                <dd>
                  <strong>{weekResult.isoCode}</strong>
                </dd>
              </div>
              <div>
                <dt>{isFr ? "Lundi (début)" : "Monday (start)"}</dt>
                <dd>{weekResult.start}</dd>
              </div>
              <div>
                <dt>{isFr ? "Dimanche (fin)" : "Sunday (end)"}</dt>
                <dd>{weekResult.end}</dd>
              </div>
              <div>
                <dt>{isFr ? "Plage" : "Range"}</dt>
                <dd className="converterMuted">{weekResult.range}</dd>
              </div>
              <div>
                <dt>{isFr ? "Total semaines dans l’année" : "Total weeks in year"}</dt>
                <dd>{weekResult.maxWeek}</dd>
              </div>
            </dl>
          ) : (
            <p className="converterError">{isFr ? "Entrée invalide." : "Invalid input."}</p>
          )}
        </div>
      )}
    </div>
  );
}
