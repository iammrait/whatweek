import type { Locale } from "@/lib/i18n";

export type SchoolProvinceCode = "ab" | "on" | "ns" | "bc" | "qc";

export const schoolProvinces: Array<{
  code: SchoolProvinceCode;
  /** Maps to the broader provinces.ts ProvinceCode */
  provinceCode: "CA-AB" | "CA-ON" | "CA-NS" | "CA-BC" | "CA-QC";
  nameEn: string;
  nameFr: string;
}> = [
  { code: "ab", provinceCode: "CA-AB", nameEn: "Alberta", nameFr: "Alberta" },
  { code: "bc", provinceCode: "CA-BC", nameEn: "British Columbia", nameFr: "Colombie-Britannique" },
  { code: "on", provinceCode: "CA-ON", nameEn: "Ontario", nameFr: "Ontario" },
  { code: "ns", provinceCode: "CA-NS", nameEn: "Nova Scotia", nameFr: "Nouvelle-Écosse" },
  { code: "qc", provinceCode: "CA-QC", nameEn: "Quebec", nameFr: "Québec" },
];

export function isSchoolProvinceCode(value: string): value is SchoolProvinceCode {
  return schoolProvinces.some((entry) => entry.code === value);
}

/**
 * Approximate provincial school calendar dates. These mirror typical board
 * calendars (TDSB / EMSB / VSB / HRCE) — exact dates vary by board, so the
 * page includes a disclaimer.
 *
 * @param startYear the first year of the school year (e.g. 2026 for 2026-27).
 */
type Term = {
  labelEn: string;
  labelFr: string;
  startMonthDay: [number, number];
  endMonthDay: [number, number];
  startsInSecondYear?: boolean;
  endsInSecondYear?: boolean;
};

type Break = {
  labelEn: string;
  labelFr: string;
  startMonthDay: [number, number];
  endMonthDay: [number, number];
  startsInSecondYear?: boolean;
  endsInSecondYear?: boolean;
};

const provincialSchedules: Record<SchoolProvinceCode, { firstDay: [number, number]; lastDay: [number, number]; breaks: Break[]; terms: Term[] }> = {
  ab: {
    firstDay: [8, 31],
    lastDay: [5, 27],
    terms: [
      { labelEn: "Fall term", labelFr: "Automne", startMonthDay: [8, 31], endMonthDay: [11, 22] },
      { labelEn: "Winter term", labelFr: "Hiver", startMonthDay: [11, 25], endMonthDay: [2, 28], endsInSecondYear: true },
      { labelEn: "Spring term", labelFr: "Printemps", startMonthDay: [3, 1], endMonthDay: [5, 27], startsInSecondYear: true, endsInSecondYear: true },
    ],
    breaks: [
      { labelEn: "Thanksgiving break", labelFr: "Action de grâce", startMonthDay: [9, 13], endMonthDay: [9, 13] },
      { labelEn: "Winter break", labelFr: "Vacances d'hiver", startMonthDay: [11, 22], endMonthDay: [0, 5], endsInSecondYear: true },
      { labelEn: "Family Day", labelFr: "Jour de la famille", startMonthDay: [1, 16], endMonthDay: [1, 16], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "Spring break", labelFr: "Relâche", startMonthDay: [2, 28], endMonthDay: [3, 6], startsInSecondYear: true, endsInSecondYear: true },
    ],
  },
  bc: {
    firstDay: [8, 2],
    lastDay: [5, 27],
    terms: [
      { labelEn: "Term 1", labelFr: "Trimestre 1", startMonthDay: [8, 2], endMonthDay: [11, 18] },
      { labelEn: "Term 2", labelFr: "Trimestre 2", startMonthDay: [0, 5], endMonthDay: [2, 13], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "Term 3", labelFr: "Trimestre 3", startMonthDay: [2, 23], endMonthDay: [5, 27], startsInSecondYear: true, endsInSecondYear: true },
    ],
    breaks: [
      { labelEn: "Winter break", labelFr: "Vacances d'hiver", startMonthDay: [11, 21], endMonthDay: [0, 4], endsInSecondYear: true },
      { labelEn: "Spring break", labelFr: "Relâche", startMonthDay: [2, 16], endMonthDay: [2, 22], startsInSecondYear: true, endsInSecondYear: true },
    ],
  },
  on: {
    firstDay: [8, 2],
    lastDay: [5, 26],
    terms: [
      { labelEn: "Term 1", labelFr: "Trimestre 1", startMonthDay: [8, 2], endMonthDay: [11, 19] },
      { labelEn: "Term 2", labelFr: "Trimestre 2", startMonthDay: [0, 5], endMonthDay: [5, 26], startsInSecondYear: true, endsInSecondYear: true },
    ],
    breaks: [
      { labelEn: "Thanksgiving break", labelFr: "Action de grâce", startMonthDay: [9, 12], endMonthDay: [9, 12] },
      { labelEn: "Winter break", labelFr: "Vacances d'hiver", startMonthDay: [11, 22], endMonthDay: [0, 4], endsInSecondYear: true },
      { labelEn: "Family Day", labelFr: "Jour de la famille", startMonthDay: [1, 16], endMonthDay: [1, 16], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "March Break", labelFr: "Relâche de mars", startMonthDay: [2, 9], endMonthDay: [2, 13], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "Good Friday", labelFr: "Vendredi saint", startMonthDay: [3, 3], endMonthDay: [3, 3], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "Victoria Day", labelFr: "Fête de la Reine", startMonthDay: [4, 18], endMonthDay: [4, 18], startsInSecondYear: true, endsInSecondYear: true },
    ],
  },
  ns: {
    firstDay: [8, 4],
    lastDay: [5, 26],
    terms: [
      { labelEn: "Term 1", labelFr: "Trimestre 1", startMonthDay: [8, 4], endMonthDay: [11, 19] },
      { labelEn: "Term 2", labelFr: "Trimestre 2", startMonthDay: [0, 5], endMonthDay: [5, 26], startsInSecondYear: true, endsInSecondYear: true },
    ],
    breaks: [
      { labelEn: "Thanksgiving break", labelFr: "Action de grâce", startMonthDay: [9, 12], endMonthDay: [9, 12] },
      { labelEn: "Remembrance Day", labelFr: "Jour du Souvenir", startMonthDay: [10, 11], endMonthDay: [10, 11] },
      { labelEn: "Winter break", labelFr: "Vacances d'hiver", startMonthDay: [11, 22], endMonthDay: [0, 4], endsInSecondYear: true },
      { labelEn: "Heritage Day", labelFr: "Fête du patrimoine", startMonthDay: [1, 16], endMonthDay: [1, 16], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "March Break", labelFr: "Relâche de mars", startMonthDay: [2, 16], endMonthDay: [2, 20], startsInSecondYear: true, endsInSecondYear: true },
    ],
  },
  qc: {
    firstDay: [7, 31],
    lastDay: [5, 23],
    terms: [
      { labelEn: "Étape 1", labelFr: "Étape 1", startMonthDay: [7, 31], endMonthDay: [10, 6] },
      { labelEn: "Étape 2", labelFr: "Étape 2", startMonthDay: [10, 9], endMonthDay: [1, 13], endsInSecondYear: true },
      { labelEn: "Étape 3", labelFr: "Étape 3", startMonthDay: [1, 16], endMonthDay: [5, 23], startsInSecondYear: true, endsInSecondYear: true },
    ],
    breaks: [
      { labelEn: "Action de grâces", labelFr: "Action de grâces", startMonthDay: [9, 12], endMonthDay: [9, 12] },
      { labelEn: "Vacances de Noël", labelFr: "Vacances de Noël", startMonthDay: [11, 21], endMonthDay: [0, 4], endsInSecondYear: true },
      { labelEn: "Semaine de relâche", labelFr: "Semaine de relâche", startMonthDay: [2, 2], endMonthDay: [2, 6], startsInSecondYear: true, endsInSecondYear: true },
      { labelEn: "Vendredi saint", labelFr: "Vendredi saint", startMonthDay: [3, 3], endMonthDay: [3, 3], startsInSecondYear: true, endsInSecondYear: true },
    ],
  },
};

function utcDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
}

function dateForMonthDay(startYear: number, monthDay: [number, number], inSecondYear: boolean | undefined): Date {
  const targetYear = inSecondYear ? startYear + 1 : startYear;
  return utcDate(targetYear, monthDay[0], monthDay[1]);
}

export type SchoolYearTerm = { labelEn: string; labelFr: string; start: Date; end: Date };
export type SchoolYearBreak = SchoolYearTerm;

export function getSchoolYearPlan(province: SchoolProvinceCode, startYear: number, locale: Locale) {
  const cfg = provincialSchedules[province];
  return {
    locale,
    province,
    firstDay: dateForMonthDay(startYear, cfg.firstDay, false),
    lastDay: dateForMonthDay(startYear, cfg.lastDay, true),
    terms: cfg.terms.map((term) => ({
      labelEn: term.labelEn,
      labelFr: term.labelFr,
      start: dateForMonthDay(startYear, term.startMonthDay, term.startsInSecondYear),
      end: dateForMonthDay(startYear, term.endMonthDay, term.endsInSecondYear),
    })) satisfies SchoolYearTerm[],
    breaks: cfg.breaks.map((br) => ({
      labelEn: br.labelEn,
      labelFr: br.labelFr,
      start: dateForMonthDay(startYear, br.startMonthDay, br.startsInSecondYear),
      end: dateForMonthDay(startYear, br.endMonthDay, br.endsInSecondYear),
    })) satisfies SchoolYearBreak[],
  };
}
