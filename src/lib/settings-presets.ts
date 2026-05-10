export type FirstDay = "monday" | "sunday" | "saturday";
export type WeekRule = "iso" | "first-day" | "first-four-day";

export type SettingsPreset = {
  /** Slug-safe id, used in ?preset=<id> URLs and localStorage keys. */
  id: string;
  name: string;
  firstDay: FirstDay;
  rule: WeekRule;
  /** Optional province slug like "on", "qc". */
  province?: string;
  /** ISO timestamp of last update — used for sort order. */
  updatedAt: string;
};

export const PRESETS_STORAGE_KEY = "ww_settings_presets_v1";

export const builtInPresets: SettingsPreset[] = [
  {
    id: "iso",
    name: "ISO 8601 (Monday + first-Thursday)",
    firstDay: "monday",
    rule: "iso",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "canada-payroll",
    name: "Canada payroll (Sunday + Jan 1 week)",
    firstDay: "sunday",
    rule: "first-day",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "us-school",
    name: "US school (Sunday + 4-day rule)",
    firstDay: "sunday",
    rule: "first-four-day",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function isFirstDay(value: string): value is FirstDay {
  return value === "monday" || value === "sunday" || value === "saturday";
}

export function isWeekRule(value: string): value is WeekRule {
  return value === "iso" || value === "first-day" || value === "first-four-day";
}

export function slugifyPresetId(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
