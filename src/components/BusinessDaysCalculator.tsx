"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { provinceCodes, provinceNames, type ProvinceCode } from "@/lib/provinces";

type HolidayDto = {
  date: string;
  nameEn: string;
  nameFr: string;
  global?: boolean;
  counties?: string[] | null;
};

type Props = {
  locale: Locale;
  defaultStart: string;
  defaultEnd: string;
  defaultProvince: ProvinceCode | null;
  holidaysByYear: Record<string, HolidayDto[]>;
};

function parseDate(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [y, m, d] = input.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

function ymd(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function holidayMatchesProvince(holiday: HolidayDto, province: ProvinceCode | null): boolean {
  if (holiday.global) return true;
  if (!province) return holiday.global === undefined;
  if (!holiday.counties || holiday.counties.length === 0) return false;
  return holiday.counties.includes(province);
}

function buildHolidaySet(
  holidaysByYear: Record<string, HolidayDto[]>,
  province: ProvinceCode | null,
  fromYear: number,
  toYear: number,
): Set<string> {
  const set = new Set<string>();
  for (let year = fromYear; year <= toYear; year += 1) {
    const list = holidaysByYear[String(year)] ?? [];
    for (const holiday of list) {
      if (holidayMatchesProvince(holiday, province)) {
        set.add(holiday.date);
      }
    }
  }
  return set;
}

function isBusinessDay(date: Date, holidaySet: Set<string>): boolean {
  const day = date.getUTCDay();
  if (day === 0 || day === 6) return false;
  return !holidaySet.has(ymd(date));
}

export function BusinessDaysCalculator({
  locale,
  defaultStart,
  defaultEnd,
  defaultProvince,
  holidaysByYear,
}: Props) {
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const [mode, setMode] = useState<"between" | "add">("between");
  const [startValue, setStartValue] = useState(defaultStart);
  const [endValue, setEndValue] = useState(defaultEnd);
  const [offsetValue, setOffsetValue] = useState("10");
  const [province, setProvince] = useState<ProvinceCode | "">(defaultProvince ?? "");

  const provinceSelected: ProvinceCode | null = province === "" ? null : province;

  const betweenResult = useMemo(() => {
    const start = parseDate(startValue);
    const end = parseDate(endValue);
    if (!start || !end) return null;
    if (start > end) return { error: isFr ? "La date de fin doit suivre la date de début." : "End date must be on or after start date." };
    const startYear = start.getUTCFullYear();
    const endYear = end.getUTCFullYear();
    const holidaySet = buildHolidaySet(holidaysByYear, provinceSelected, startYear, endYear);

    let totalDays = 0;
    let businessDays = 0;
    let holidayHits = 0;
    let weekendDays = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      totalDays += 1;
      const day = cursor.getUTCDay();
      if (day === 0 || day === 6) {
        weekendDays += 1;
      } else if (holidaySet.has(ymd(cursor))) {
        holidayHits += 1;
      } else {
        businessDays += 1;
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return { totalDays, businessDays, holidayHits, weekendDays };
  }, [startValue, endValue, provinceSelected, holidaysByYear, isFr]);

  const addResult = useMemo(() => {
    const start = parseDate(startValue);
    const offset = Number(offsetValue);
    if (!start || !Number.isFinite(offset)) return null;
    const offsetInt = Math.trunc(offset);
    const startYear = start.getUTCFullYear();
    const targetYear = startYear + Math.ceil(Math.abs(offsetInt) / 200) + 1;
    const fromYear = Math.min(startYear, targetYear);
    const toYear = Math.max(startYear, targetYear);
    const holidaySet = buildHolidaySet(holidaysByYear, provinceSelected, fromYear, toYear);

    const cursor = new Date(start);
    let remaining = Math.abs(offsetInt);
    const direction = offsetInt >= 0 ? 1 : -1;
    let safety = 0;
    while (remaining > 0 && safety < 100_000) {
      cursor.setUTCDate(cursor.getUTCDate() + direction);
      if (isBusinessDay(cursor, holidaySet)) remaining -= 1;
      safety += 1;
    }
    if (safety >= 100_000) return null;

    const formatted = new Intl.DateTimeFormat(localeCode, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(cursor);
    return { resultIso: ymd(cursor), formatted };
  }, [startValue, offsetValue, provinceSelected, holidaysByYear, localeCode]);

  return (
    <div className="converterCard">
      <div className="converterTabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "between"}
          className={mode === "between" ? "converterTabActive" : ""}
          onClick={() => setMode("between")}
        >
          {isFr ? "Entre deux dates" : "Between two dates"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "add"}
          className={mode === "add" ? "converterTabActive" : ""}
          onClick={() => setMode("add")}
        >
          {isFr ? "Ajouter des jours ouvrables" : "Add business days"}
        </button>
      </div>

      <div className="converterPanel">
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="bdc-province">
              {isFr ? "Province (jours fériés)" : "Province (holiday set)"}
            </label>
            <select
              id="bdc-province"
              className="converterInput"
              value={province}
              onChange={(event) => setProvince(event.target.value as ProvinceCode | "")}
            >
              <option value="">{isFr ? "Tout le Canada (fédéral)" : "All Canada (federal)"}</option>
              {provinceCodes.map((code) => (
                <option key={code} value={code}>
                  {provinceNames[code][locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "between" ? (
          <>
            <div className="converterRow">
              <div>
                <label className="converterLabel" htmlFor="bdc-start">
                  {isFr ? "Date de début" : "Start date"}
                </label>
                <input
                  id="bdc-start"
                  className="converterInput"
                  type="date"
                  value={startValue}
                  onChange={(event) => setStartValue(event.target.value)}
                />
              </div>
              <div>
                <label className="converterLabel" htmlFor="bdc-end">
                  {isFr ? "Date de fin" : "End date"}
                </label>
                <input
                  id="bdc-end"
                  className="converterInput"
                  type="date"
                  value={endValue}
                  onChange={(event) => setEndValue(event.target.value)}
                />
              </div>
            </div>

            {betweenResult && "error" in betweenResult ? (
              <p className="converterError">{betweenResult.error}</p>
            ) : betweenResult ? (
              <dl className="converterResults">
                <div>
                  <dt>{isFr ? "Jours ouvrables" : "Business days"}</dt>
                  <dd>
                    <strong>{betweenResult.businessDays}</strong>
                  </dd>
                </div>
                <div>
                  <dt>{isFr ? "Jours totaux (inclus)" : "Total days (inclusive)"}</dt>
                  <dd>{betweenResult.totalDays}</dd>
                </div>
                <div>
                  <dt>{isFr ? "Week-ends" : "Weekend days"}</dt>
                  <dd>{betweenResult.weekendDays}</dd>
                </div>
                <div>
                  <dt>{isFr ? "Jours fériés" : "Statutory holidays"}</dt>
                  <dd>{betweenResult.holidayHits}</dd>
                </div>
              </dl>
            ) : (
              <p className="converterError">{isFr ? "Dates invalides." : "Invalid dates."}</p>
            )}
          </>
        ) : (
          <>
            <div className="converterRow">
              <div>
                <label className="converterLabel" htmlFor="bdc-add-start">
                  {isFr ? "Date de début" : "Start date"}
                </label>
                <input
                  id="bdc-add-start"
                  className="converterInput"
                  type="date"
                  value={startValue}
                  onChange={(event) => setStartValue(event.target.value)}
                />
              </div>
              <div>
                <label className="converterLabel" htmlFor="bdc-add-offset">
                  {isFr ? "Jours ouvrables (±)" : "Business days (±)"}
                </label>
                <input
                  id="bdc-add-offset"
                  className="converterInput"
                  type="number"
                  step={1}
                  value={offsetValue}
                  onChange={(event) => setOffsetValue(event.target.value)}
                />
              </div>
            </div>

            {addResult ? (
              <dl className="converterResults">
                <div>
                  <dt>{isFr ? "Date résultante" : "Resulting date"}</dt>
                  <dd>
                    <strong>{addResult.formatted}</strong>
                  </dd>
                </div>
                <div>
                  <dt>ISO</dt>
                  <dd>{addResult.resultIso}</dd>
                </div>
              </dl>
            ) : (
              <p className="converterError">{isFr ? "Entrée invalide." : "Invalid input."}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
