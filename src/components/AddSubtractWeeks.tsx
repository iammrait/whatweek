"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { addWeeks, parseIsoDate, ymd } from "@/lib/date-math";
import { getIsoWeekNumber, getIsoWeekYear } from "@/lib/week";

type Mode = "add" | "subtract";

type Props = {
  locale: Locale;
  defaultStart: string;
  defaultWeeks?: string;
  defaultMode?: Mode;
};

function formatLongUtc(date: Date, locale: Locale): string {
  const localeCode = locale === "fr" ? "fr-CA" : "en-CA";
  return new Intl.DateTimeFormat(localeCode, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function AddSubtractWeeks({ locale, defaultStart, defaultWeeks = "4", defaultMode = "add" }: Props) {
  const isFr = locale === "fr";
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [startValue, setStartValue] = useState(defaultStart);
  const [weeksValue, setWeeksValue] = useState(defaultWeeks);

  const result = useMemo(() => {
    const start = parseIsoDate(startValue);
    const weeks = Number(weeksValue);
    if (!start || !Number.isFinite(weeks)) return null;
    const offset = mode === "add" ? weeks : -weeks;
    const out = addWeeks(start, offset);
    return {
      iso: ymd(out),
      long: formatLongUtc(out, locale),
      isoWeek: getIsoWeekNumber(out),
      isoYear: getIsoWeekYear(out),
      weekday: new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { weekday: "long", timeZone: "UTC" }).format(out),
    };
  }, [startValue, weeksValue, mode, locale]);

  return (
    <div className="converterCard">
      <div className="converterTabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "add"}
          className={mode === "add" ? "converterTabActive" : ""}
          onClick={() => setMode("add")}
        >
          {isFr ? "Ajouter des semaines" : "Add weeks"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "subtract"}
          className={mode === "subtract" ? "converterTabActive" : ""}
          onClick={() => setMode("subtract")}
        >
          {isFr ? "Soustraire des semaines" : "Subtract weeks"}
        </button>
      </div>

      <div className="converterPanel">
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="aw-start">{isFr ? "Date de départ" : "Start date"}</label>
            <input id="aw-start" className="converterInput" type="date" value={startValue} onChange={(e) => setStartValue(e.target.value)} />
          </div>
          <div>
            <label className="converterLabel" htmlFor="aw-weeks">
              {mode === "add" ? (isFr ? "Semaines à ajouter" : "Weeks to add") : (isFr ? "Semaines à soustraire" : "Weeks to subtract")}
            </label>
            <input id="aw-weeks" className="converterInput" type="number" step={1} value={weeksValue} onChange={(e) => setWeeksValue(e.target.value)} />
          </div>
        </div>

        {result ? (
          <dl className="converterResults">
            <div>
              <dt>{isFr ? "Date résultante" : "Resulting date"}</dt>
              <dd><strong>{result.long}</strong></dd>
            </div>
            <div>
              <dt>ISO</dt>
              <dd>{result.iso}</dd>
            </div>
            <div>
              <dt>{isFr ? "Jour de la semaine" : "Weekday"}</dt>
              <dd>{result.weekday}</dd>
            </div>
            <div>
              <dt>{isFr ? "Semaine ISO" : "ISO week"}</dt>
              <dd>{result.isoYear}-W{String(result.isoWeek).padStart(2, "0")}</dd>
            </div>
          </dl>
        ) : (
          <p className="converterError">{isFr ? "Entrée invalide." : "Invalid input."}</p>
        )}
      </div>
    </div>
  );
}
