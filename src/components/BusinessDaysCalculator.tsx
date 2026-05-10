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

type CourtRule = {
  id: string;
  labelEn: string;
  labelFr: string;
  /** True if Saturday/Sunday count toward "days" in court-rule deadlines. */
  includeWeekends: boolean;
  /** True if statutory holidays count toward the day count. */
  includeHolidays: boolean;
  /** If the deadline lands on a non-business day, roll forward to next business day. */
  rollForwardIfNonBusiness: boolean;
  noteEn: string;
  noteFr: string;
};

const courtRules: CourtRule[] = [
  {
    id: "business",
    labelEn: "Business days (default)",
    labelFr: "Jours ouvrables (défaut)",
    includeWeekends: false,
    includeHolidays: false,
    rollForwardIfNonBusiness: false,
    noteEn: "Skip weekends and statutory holidays. Most contracts and SLAs use this rule.",
    noteFr: "Ignore les week-ends et les jours fériés. La plupart des contrats et SLA suivent cette règle.",
  },
  {
    id: "calendar",
    labelEn: "Calendar days, roll forward to business day",
    labelFr: "Jours civils, reporté au prochain jour ouvrable",
    includeWeekends: true,
    includeHolidays: true,
    rollForwardIfNonBusiness: true,
    noteEn: "Calendar days are counted. If the deadline lands on a weekend or holiday, it rolls forward.",
    noteFr: "Tous les jours civils comptent. Si l'échéance tombe un week-end ou férié, elle est reportée.",
  },
  {
    id: "court-rules-ontario",
    labelEn: "Ontario Rules of Civil Procedure (Rule 3)",
    labelFr: "Règles de procédure civile (Ontario, règle 3)",
    includeWeekends: true,
    includeHolidays: false,
    rollForwardIfNonBusiness: true,
    noteEn: "Counted in calendar days, excluding statutory holidays from the count; if the last day is a weekend/holiday it rolls to next business day.",
    noteFr: "Calculé en jours civils sans compter les jours fériés ; si le dernier jour tombe un week-end/férié, il est reporté.",
  },
  {
    id: "court-rules-bc",
    labelEn: "BC Supreme Court Civil Rules (Rule 22-4)",
    labelFr: "Règles de procédure civile (C.-B., règle 22-4)",
    includeWeekends: true,
    includeHolidays: false,
    rollForwardIfNonBusiness: true,
    noteEn: "Calendar days excluding holidays from the count; deadlines on a non-business day roll forward.",
    noteFr: "Jours civils sans compter les fériés ; échéance non ouvrable reportée.",
  },
  {
    id: "court-rules-federal",
    labelEn: "Federal Court Rules (Rule 6)",
    labelFr: "Règles de la Cour fédérale (règle 6)",
    includeWeekends: true,
    includeHolidays: false,
    rollForwardIfNonBusiness: true,
    noteEn: "Same logic as Ontario / BC for short periods (<7 days); for longer periods, all calendar days count.",
    noteFr: "Même logique que ON / C.-B. pour les courtes périodes (< 7 jours) ; pour les périodes plus longues, tous les jours comptent.",
  },
];

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

function rollForwardToBusinessDay(date: Date, holidaySet: Set<string>): Date {
  const cursor = new Date(date);
  while (!isBusinessDay(cursor, holidaySet)) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return cursor;
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
  const [mode, setMode] = useState<"between" | "add" | "court" | "sequential">("between");
  const [startValue, setStartValue] = useState(defaultStart);
  const [endValue, setEndValue] = useState(defaultEnd);
  const [offsetValue, setOffsetValue] = useState("10");
  const [courtDays, setCourtDays] = useState("21");
  const [courtRule, setCourtRule] = useState(courtRules[0].id);
  const [sequentialSpec, setSequentialSpec] = useState("10,5,3");
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

  const courtResult = useMemo(() => {
    const start = parseDate(startValue);
    const days = Math.trunc(Number(courtDays));
    if (!start || !Number.isFinite(days) || days <= 0) return null;
    const rule = courtRules.find((r) => r.id === courtRule) ?? courtRules[0];
    const startYear = start.getUTCFullYear();
    const toYear = startYear + 4;
    const holidaySet = buildHolidaySet(holidaysByYear, provinceSelected, startYear, toYear);

    const cursor = new Date(start);
    let counted = 0;
    let safety = 0;
    while (counted < days && safety < 50_000) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      const isWeekend = cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6;
      const isHoliday = holidaySet.has(ymd(cursor));
      let countsTowardDeadline = true;
      if (!rule.includeWeekends && isWeekend) countsTowardDeadline = false;
      if (!rule.includeHolidays && isHoliday) countsTowardDeadline = false;
      if (countsTowardDeadline) counted += 1;
      safety += 1;
    }
    if (safety >= 50_000) return null;

    let final = new Date(cursor);
    let rolled = false;
    if (rule.rollForwardIfNonBusiness && !isBusinessDay(final, holidaySet)) {
      final = rollForwardToBusinessDay(final, holidaySet);
      rolled = true;
    }

    const formatted = new Intl.DateTimeFormat(localeCode, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(final);

    return {
      ruleLabel: isFr ? rule.labelFr : rule.labelEn,
      ruleNote: isFr ? rule.noteFr : rule.noteEn,
      resultIso: ymd(final),
      rawIso: ymd(cursor),
      formatted,
      rolled,
    };
  }, [startValue, courtDays, courtRule, provinceSelected, holidaysByYear, isFr, localeCode]);

  const sequentialResult = useMemo(() => {
    const start = parseDate(startValue);
    const segments = sequentialSpec
      .split(",")
      .map((token) => Number(token.trim()))
      .filter((value) => Number.isFinite(value));
    if (!start || segments.length === 0) return null;
    const startYear = start.getUTCFullYear();
    const toYear = startYear + Math.ceil(segments.reduce((sum, n) => sum + Math.abs(n), 0) / 200) + 2;
    const holidaySet = buildHolidaySet(holidaysByYear, provinceSelected, startYear, toYear);

    const rows: Array<{ segment: number; iso: string; formatted: string }> = [];
    const cursor = new Date(start);
    for (const segment of segments) {
      let remaining = Math.abs(Math.trunc(segment));
      const direction = segment >= 0 ? 1 : -1;
      let safety = 0;
      while (remaining > 0 && safety < 50_000) {
        cursor.setUTCDate(cursor.getUTCDate() + direction);
        if (isBusinessDay(cursor, holidaySet)) remaining -= 1;
        safety += 1;
      }
      if (safety >= 50_000) return null;
      rows.push({
        segment,
        iso: ymd(cursor),
        formatted: new Intl.DateTimeFormat(localeCode, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        }).format(cursor),
      });
    }
    return rows;
  }, [startValue, sequentialSpec, provinceSelected, holidaysByYear, localeCode]);

  return (
    <div className="converterCard">
      <div className="converterTabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "between"} className={mode === "between" ? "converterTabActive" : ""} onClick={() => setMode("between")}>
          {isFr ? "Entre deux dates" : "Between two dates"}
        </button>
        <button type="button" role="tab" aria-selected={mode === "add"} className={mode === "add" ? "converterTabActive" : ""} onClick={() => setMode("add")}>
          {isFr ? "Ajouter des jours" : "Add business days"}
        </button>
        <button type="button" role="tab" aria-selected={mode === "court"} className={mode === "court" ? "converterTabActive" : ""} onClick={() => setMode("court")}>
          {isFr ? "Échéance judiciaire" : "Court deadline"}
        </button>
        <button type="button" role="tab" aria-selected={mode === "sequential"} className={mode === "sequential" ? "converterTabActive" : ""} onClick={() => setMode("sequential")}>
          {isFr ? "Périodes séquentielles" : "Sequential periods"}
        </button>
      </div>

      <div className="converterPanel">
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="bdc-province">
              {isFr ? "Province (jours fériés)" : "Province (holiday set)"}
            </label>
            <select id="bdc-province" className="converterInput" value={province} onChange={(event) => setProvince(event.target.value as ProvinceCode | "")}>
              <option value="">{isFr ? "Tout le Canada (fédéral)" : "All Canada (federal)"}</option>
              {provinceCodes.map((code) => (
                <option key={code} value={code}>
                  {provinceNames[code][locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "between" && (
          <>
            <div className="converterRow">
              <div>
                <label className="converterLabel" htmlFor="bdc-start">{isFr ? "Date de début" : "Start date"}</label>
                <input id="bdc-start" className="converterInput" type="date" value={startValue} onChange={(event) => setStartValue(event.target.value)} />
              </div>
              <div>
                <label className="converterLabel" htmlFor="bdc-end">{isFr ? "Date de fin" : "End date"}</label>
                <input id="bdc-end" className="converterInput" type="date" value={endValue} onChange={(event) => setEndValue(event.target.value)} />
              </div>
            </div>

            {betweenResult && "error" in betweenResult ? (
              <p className="converterError">{betweenResult.error}</p>
            ) : betweenResult ? (
              <dl className="converterResults">
                <div>
                  <dt>{isFr ? "Jours ouvrables" : "Business days"}</dt>
                  <dd><strong>{betweenResult.businessDays}</strong></dd>
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
        )}

        {mode === "add" && (
          <>
            <div className="converterRow">
              <div>
                <label className="converterLabel" htmlFor="bdc-add-start">{isFr ? "Date de début" : "Start date"}</label>
                <input id="bdc-add-start" className="converterInput" type="date" value={startValue} onChange={(event) => setStartValue(event.target.value)} />
              </div>
              <div>
                <label className="converterLabel" htmlFor="bdc-add-offset">{isFr ? "Jours ouvrables (±)" : "Business days (±)"}</label>
                <input id="bdc-add-offset" className="converterInput" type="number" step={1} value={offsetValue} onChange={(event) => setOffsetValue(event.target.value)} />
              </div>
            </div>
            {addResult ? (
              <dl className="converterResults">
                <div>
                  <dt>{isFr ? "Date résultante" : "Resulting date"}</dt>
                  <dd><strong>{addResult.formatted}</strong></dd>
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

        {mode === "court" && (
          <>
            <div className="converterRow">
              <div>
                <label className="converterLabel" htmlFor="bdc-court-start">{isFr ? "Date de signification" : "Service / trigger date"}</label>
                <input id="bdc-court-start" className="converterInput" type="date" value={startValue} onChange={(event) => setStartValue(event.target.value)} />
              </div>
              <div>
                <label className="converterLabel" htmlFor="bdc-court-days">{isFr ? "Délai (jours)" : "Deadline (days)"}</label>
                <input id="bdc-court-days" className="converterInput" type="number" min={1} value={courtDays} onChange={(event) => setCourtDays(event.target.value)} />
              </div>
            </div>
            <div>
              <label className="converterLabel" htmlFor="bdc-court-rule">{isFr ? "Règle applicable" : "Applicable rule"}</label>
              <select id="bdc-court-rule" className="converterInput" value={courtRule} onChange={(event) => setCourtRule(event.target.value)}>
                {courtRules.map((rule) => (
                  <option key={rule.id} value={rule.id}>{isFr ? rule.labelFr : rule.labelEn}</option>
                ))}
              </select>
            </div>

            {courtResult ? (
              <>
                <dl className="converterResults">
                  <div>
                    <dt>{isFr ? "Échéance calculée" : "Computed deadline"}</dt>
                    <dd><strong>{courtResult.formatted}</strong></dd>
                  </div>
                  <div>
                    <dt>ISO</dt>
                    <dd>{courtResult.resultIso}</dd>
                  </div>
                  <div>
                    <dt>{isFr ? "Reporté ?" : "Rolled forward?"}</dt>
                    <dd>{courtResult.rolled ? (isFr ? "Oui" : "Yes") : isFr ? "Non" : "No"}</dd>
                  </div>
                  <div>
                    <dt>{isFr ? "Règle" : "Rule"}</dt>
                    <dd>{courtResult.ruleLabel}</dd>
                  </div>
                </dl>
                <p className="converterMuted" style={{ fontSize: "0.85rem" }}>
                  {courtResult.ruleNote}
                </p>
                <p className="converterError" style={{ fontSize: "0.85rem" }}>
                  <strong>{isFr ? "Avis :" : "Disclaimer:"}</strong>{" "}
                  {isFr
                    ? "Cet outil est informatif. Vérifiez toujours auprès d'un professionnel du droit pour toute échéance judiciaire réelle."
                    : "This tool is informational only. Always verify with a legal professional for any real court deadline."}
                </p>
              </>
            ) : (
              <p className="converterError">{isFr ? "Entrée invalide." : "Invalid input."}</p>
            )}
          </>
        )}

        {mode === "sequential" && (
          <>
            <div className="converterRow">
              <div>
                <label className="converterLabel" htmlFor="bdc-seq-start">{isFr ? "Date de départ" : "Start date"}</label>
                <input id="bdc-seq-start" className="converterInput" type="date" value={startValue} onChange={(event) => setStartValue(event.target.value)} />
              </div>
              <div>
                <label className="converterLabel" htmlFor="bdc-seq-spec">{isFr ? "Périodes (jours ouvrables, séparés par virgule)" : "Periods (business days, comma-separated)"}</label>
                <input id="bdc-seq-spec" className="converterInput" type="text" value={sequentialSpec} onChange={(event) => setSequentialSpec(event.target.value)} placeholder="10,5,3" />
              </div>
            </div>
            {sequentialResult && sequentialResult.length > 0 ? (
              <table className="payTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{isFr ? "Saut (jours ouvr.)" : "Step (business days)"}</th>
                    <th>{isFr ? "Date" : "Date"}</th>
                    <th>ISO</th>
                  </tr>
                </thead>
                <tbody>
                  {sequentialResult.map((row, index) => (
                    <tr key={`${row.iso}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.segment > 0 ? `+${row.segment}` : row.segment}</td>
                      <td><strong>{row.formatted}</strong></td>
                      <td>{row.iso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="converterError">{isFr ? "Spécification invalide. Exemple : 10, 5, 3" : "Invalid spec. Example: 10, 5, 3"}</p>
            )}
            <p className="converterMuted" style={{ fontSize: "0.85rem" }}>
              {isFr
                ? "Mode pratique pour les délais en cascade : 10 jours pour répondre, puis 5 pour réplique, puis 3 pour pré-audience, etc."
                : "Useful for cascading deadlines: 10 business days to respond, then 5 for reply, then 3 for pre-trial, etc."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
