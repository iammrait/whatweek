"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { diffInDays, parseIsoDate } from "@/lib/date-math";

type Mode = "until" | "between";

type Props = {
  locale: Locale;
  defaultStart: string;
  defaultEnd: string;
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

export function WeeksCalculator({ locale, defaultStart, defaultEnd, defaultMode = "until" }: Props) {
  const isFr = locale === "fr";
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [startValue, setStartValue] = useState(defaultStart);
  const [endValue, setEndValue] = useState(defaultEnd);

  const result = useMemo(() => {
    const start = parseIsoDate(startValue);
    const end = parseIsoDate(endValue);
    if (!start || !end) return null;
    const days = diffInDays(end, start);
    const absDays = Math.abs(days);
    const exactWeeks = absDays / 7;
    const fullWeeks = Math.floor(absDays / 7);
    const remainderDays = absDays % 7;
    return {
      days,
      absDays,
      exactWeeks,
      fullWeeks,
      remainderDays,
      direction: days < 0 ? "past" : days === 0 ? "today" : "future",
      startLong: formatLongUtc(start, locale),
      endLong: formatLongUtc(end, locale),
    } as const;
  }, [startValue, endValue, locale]);

  return (
    <div className="converterCard">
      <div className="converterTabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "until"}
          className={mode === "until" ? "converterTabActive" : ""}
          onClick={() => setMode("until")}
        >
          {isFr ? "Semaines jusqu'à une date" : "Weeks until a date"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "between"}
          className={mode === "between" ? "converterTabActive" : ""}
          onClick={() => setMode("between")}
        >
          {isFr ? "Semaines entre deux dates" : "Weeks between two dates"}
        </button>
      </div>

      <div className="converterPanel">
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="wc-start">
              {mode === "until"
                ? isFr ? "Aujourd'hui" : "From (today)"
                : isFr ? "Date de début" : "Start date"}
            </label>
            <input
              id="wc-start"
              className="converterInput"
              type="date"
              value={startValue}
              onChange={(event) => setStartValue(event.target.value)}
            />
          </div>
          <div>
            <label className="converterLabel" htmlFor="wc-end">
              {mode === "until"
                ? isFr ? "Date cible" : "Target date"
                : isFr ? "Date de fin" : "End date"}
            </label>
            <input
              id="wc-end"
              className="converterInput"
              type="date"
              value={endValue}
              onChange={(event) => setEndValue(event.target.value)}
            />
          </div>
        </div>

        {result ? (
          <dl className="converterResults">
            <div>
              <dt>{isFr ? "Semaines complètes" : "Full weeks"}</dt>
              <dd>
                <strong>{result.fullWeeks}</strong>{" "}
                {result.remainderDays > 0 && (
                  <span className="converterMuted">
                    + {result.remainderDays} {isFr ? "j." : "days"}
                  </span>
                )}{" "}
                <span className="converterMuted">
                  {result.direction === "past"
                    ? isFr ? "(passé)" : "(in the past)"
                    : result.direction === "today"
                      ? isFr ? "(aujourd'hui)" : "(today)"
                      : isFr ? "(à venir)" : "(in the future)"}
                </span>
              </dd>
            </div>
            <div>
              <dt>{isFr ? "Semaines exactes" : "Exact weeks"}</dt>
              <dd>{result.exactWeeks.toFixed(2)}</dd>
            </div>
            <div>
              <dt>{isFr ? "Jours" : "Days"}</dt>
              <dd>{result.absDays}</dd>
            </div>
            <div>
              <dt>{isFr ? "Du" : "From"}</dt>
              <dd>{result.startLong}</dd>
            </div>
            <div>
              <dt>{isFr ? "Au" : "To"}</dt>
              <dd>{result.endLong}</dd>
            </div>
          </dl>
        ) : (
          <p className="converterError">{isFr ? "Dates invalides." : "Invalid dates."}</p>
        )}
      </div>
    </div>
  );
}
