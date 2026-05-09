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
  defaultAnchor: string;
  defaultProvince: ProvinceCode | null;
  holidaysByYear: Record<string, HolidayDto[]>;
};

type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

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

function buildHolidayMap(
  holidaysByYear: Record<string, HolidayDto[]>,
  province: ProvinceCode | null,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const list of Object.values(holidaysByYear)) {
    for (const holiday of list) {
      if (holidayMatchesProvince(holiday, province)) {
        map.set(holiday.date, holiday.nameEn);
      }
    }
  }
  return map;
}

function shiftEarlierBusinessDay(date: Date, holidayMap: Map<string, string>): Date {
  const cursor = new Date(date);
  while (cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6 || holidayMap.has(ymd(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return cursor;
}

function getIsoWeek(date: Date): number {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const isoYear = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1, 12, 0, 0));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function generateSchedule(
  anchor: Date,
  frequency: Frequency,
  count: number,
  holidayMap: Map<string, string>,
  shift: boolean,
) {
  const out: Array<{
    scheduledIso: string;
    paidIso: string;
    isoWeek: number;
    holidayName: string | null;
    shifted: boolean;
  }> = [];

  for (let i = 0; i < count; i += 1) {
    const scheduled = new Date(anchor);
    if (frequency === "weekly") {
      scheduled.setUTCDate(anchor.getUTCDate() + i * 7);
    } else if (frequency === "biweekly") {
      scheduled.setUTCDate(anchor.getUTCDate() + i * 14);
    } else if (frequency === "semimonthly") {
      const monthsForward = Math.floor(i / 2);
      scheduled.setUTCMonth(anchor.getUTCMonth() + monthsForward);
      if (i % 2 === 1) {
        scheduled.setUTCDate(15);
      }
      if (i % 2 === 0 && i !== 0) {
        scheduled.setUTCDate(anchor.getUTCDate());
      }
    } else if (frequency === "monthly") {
      scheduled.setUTCMonth(anchor.getUTCMonth() + i);
    }

    const scheduledIso = ymd(scheduled);
    const holidayName = holidayMap.get(scheduledIso) ?? null;
    const isWeekend = scheduled.getUTCDay() === 0 || scheduled.getUTCDay() === 6;
    let paidDate = scheduled;
    let shifted = false;
    if (shift && (isWeekend || holidayName !== null)) {
      paidDate = shiftEarlierBusinessDay(scheduled, holidayMap);
      shifted = paidDate.getTime() !== scheduled.getTime();
    }
    out.push({
      scheduledIso,
      paidIso: ymd(paidDate),
      isoWeek: getIsoWeek(paidDate),
      holidayName,
      shifted,
    });
  }
  return out;
}

export function PayPeriodCalculator({
  locale,
  defaultAnchor,
  defaultProvince,
  holidaysByYear,
}: Props) {
  const isFr = locale === "fr";
  const localeCode = isFr ? "fr-CA" : "en-CA";
  const [anchor, setAnchor] = useState(defaultAnchor);
  const [frequency, setFrequency] = useState<Frequency>("biweekly");
  const [count, setCount] = useState("26");
  const [shift, setShift] = useState(true);
  const [province, setProvince] = useState<ProvinceCode | "">(defaultProvince ?? "");

  const provinceSelected: ProvinceCode | null = province === "" ? null : province;
  const holidayMap = useMemo(
    () => buildHolidayMap(holidaysByYear, provinceSelected),
    [holidaysByYear, provinceSelected],
  );

  const schedule = useMemo(() => {
    const date = parseDate(anchor);
    const n = Math.max(1, Math.min(60, Number(count)));
    if (!date || !Number.isFinite(n)) return [];
    return generateSchedule(date, frequency, n, holidayMap, shift);
  }, [anchor, frequency, count, holidayMap, shift]);

  const formatPaid = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat(localeCode, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  };

  return (
    <div className="converterCard">
      <div className="converterPanel">
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="ppc-anchor">
              {isFr ? "Première date de paie" : "First pay date"}
            </label>
            <input
              id="ppc-anchor"
              className="converterInput"
              type="date"
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
            />
          </div>
          <div>
            <label className="converterLabel" htmlFor="ppc-freq">
              {isFr ? "Fréquence" : "Frequency"}
            </label>
            <select
              id="ppc-freq"
              className="converterInput"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as Frequency)}
            >
              <option value="weekly">{isFr ? "Hebdomadaire (52)" : "Weekly (52)"}</option>
              <option value="biweekly">{isFr ? "Aux 2 semaines (26)" : "Bi-weekly (26)"}</option>
              <option value="semimonthly">{isFr ? "Bimensuel (24)" : "Semi-monthly (24)"}</option>
              <option value="monthly">{isFr ? "Mensuel (12)" : "Monthly (12)"}</option>
            </select>
          </div>
        </div>
        <div className="converterRow">
          <div>
            <label className="converterLabel" htmlFor="ppc-count">
              {isFr ? "Nombre de paies" : "Number of pay dates"}
            </label>
            <input
              id="ppc-count"
              className="converterInput"
              type="number"
              min={1}
              max={60}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className="converterLabel" htmlFor="ppc-province">
              {isFr ? "Province" : "Province"}
            </label>
            <select
              id="ppc-province"
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
        <label className="converterCheckbox">
          <input type="checkbox" checked={shift} onChange={(event) => setShift(event.target.checked)} />
          {isFr
            ? "Avancer la paie au jour ouvrable précédent si elle tombe un week-end ou un jour férié"
            : "Shift pay date to the previous business day when it lands on a weekend or holiday"}
        </label>
      </div>

      <table className="payTable">
        <thead>
          <tr>
            <th>#</th>
            <th>{isFr ? "Date prévue" : "Scheduled date"}</th>
            <th>{isFr ? "Date de paie" : "Pay date"}</th>
            <th>{isFr ? "Sem." : "Wk"}</th>
            <th>{isFr ? "Note" : "Note"}</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, index) => (
            <tr key={`${row.scheduledIso}-${index}`} className={row.shifted ? "payShifted" : undefined}>
              <td>{index + 1}</td>
              <td>{formatPaid(row.scheduledIso)}</td>
              <td>
                <strong>{formatPaid(row.paidIso)}</strong>
              </td>
              <td>W{row.isoWeek}</td>
              <td className="subtle">
                {row.shifted
                  ? isFr
                    ? "Avancé (jour férié/week-end)"
                    : "Shifted (holiday/weekend)"
                  : row.holidayName
                    ? isFr
                      ? `Sur jour férié (${row.holidayName})`
                      : `On stat holiday (${row.holidayName})`
                    : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
