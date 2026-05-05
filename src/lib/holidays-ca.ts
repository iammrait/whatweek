import { getIsoWeekNumber, getIsoWeekYear } from "@/lib/week";
import { type ProvinceCode } from "@/lib/provinces";

export type Holiday = {
  nameEn: string;
  nameFr: string;
  date: Date;
  global?: boolean;
  counties?: string[] | null;
};

export type LongWeekend = {
  labelEn: string;
  labelFr: string;
  start: Date;
  end: Date;
};

type NagerHoliday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  counties: string[] | null;
  types: string[];
};

const holidayNameFrOverrides: Record<string, string> = {
  "New Year's Day": "Jour de l'An",
  "Good Friday": "Vendredi saint",
  "Easter Monday": "Lundi de Pâques",
  "Victoria Day": "Fête de la Reine",
  "Canada Day": "Fête du Canada",
  "Civic Holiday": "Congé civique",
  "Labour Day": "Fête du Travail",
  "National Day for Truth and Reconciliation": "Journée nationale de la vérité et de la réconciliation",
  Thanksgiving: "Action de grâce",
  "Remembrance Day": "Jour du Souvenir",
  "Christmas Day": "Noël",
  "Boxing Day": "Lendemain de Noël",
  "Family Day": "Jour de la famille",
  "Islander Day": "Fête des Insulaires",
  "Louis Riel Day": "Journée Louis Riel",
  "Heritage Day": "Fête du patrimoine",
  "National Patriots' Day": "Journée nationale des patriotes",
  "Saint Jean Baptiste Day": "Fête nationale du Québec",
};

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  occurrence: number,
): Date {
  const first = new Date(Date.UTC(year, month, 1, 12, 0, 0));
  const firstDay = first.getUTCDay();
  const delta = (weekday - firstDay + 7) % 7;
  const day = 1 + delta + (occurrence - 1) * 7;
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0));
  const diff = (last.getUTCDay() - weekday + 7) % 7;
  last.setUTCDate(last.getUTCDate() - diff);
  return last;
}

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function observedDate(date: Date): Date {
  const observed = new Date(date);
  const weekday = observed.getUTCDay();
  if (weekday === 6) observed.setUTCDate(observed.getUTCDate() + 2);
  if (weekday === 0) observed.setUTCDate(observed.getUTCDate() + 1);
  return observed;
}

export function getFederalHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setUTCDate(goodFriday.getUTCDate() - 2);

  const canadaDay = observedDate(new Date(Date.UTC(year, 6, 1, 12, 0, 0)));
  const remembranceDay = observedDate(new Date(Date.UTC(year, 10, 11, 12, 0, 0)));
  const christmas = observedDate(new Date(Date.UTC(year, 11, 25, 12, 0, 0)));
  const boxingDay = observedDate(new Date(Date.UTC(year, 11, 26, 12, 0, 0)));

  return [
    {
      nameEn: "New Year's Day",
      nameFr: "Jour de l'An",
      date: observedDate(new Date(Date.UTC(year, 0, 1, 12, 0, 0))),
    },
    {
      nameEn: "Good Friday",
      nameFr: "Vendredi saint",
      date: goodFriday,
    },
    {
      nameEn: "Victoria Day",
      nameFr: "Fête de la Reine",
      date: lastWeekdayOfMonth(year, 4, 1),
    },
    {
      nameEn: "Canada Day",
      nameFr: "Fête du Canada",
      date: canadaDay,
    },
    {
      nameEn: "Labour Day",
      nameFr: "Fête du Travail",
      date: nthWeekdayOfMonth(year, 8, 1, 1),
    },
    {
      nameEn: "Thanksgiving",
      nameFr: "Action de grâce",
      date: nthWeekdayOfMonth(year, 9, 1, 2),
    },
    {
      nameEn: "Remembrance Day",
      nameFr: "Jour du Souvenir",
      date: remembranceDay,
    },
    {
      nameEn: "Christmas Day",
      nameFr: "Noël",
      date: christmas,
    },
    {
      nameEn: "Boxing Day",
      nameFr: "Lendemain de Noël",
      date: boxingDay,
    },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function parseNagerHolidayDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function mapNagerHoliday(item: NagerHoliday): Holiday {
  return {
    nameEn: item.name,
    nameFr: holidayNameFrOverrides[item.name] ?? item.localName ?? item.name,
    date: parseNagerHolidayDate(item.date),
    global: item.global,
    counties: item.counties,
  };
}

function matchesProvince(holiday: Holiday, province: ProvinceCode | null): boolean {
  if (!province) {
    // Show only global/national holidays when no province is selected
    return holiday.global === true || holiday.global === undefined;
  }
  if (holiday.global) return true;
  if (!holiday.counties || holiday.counties.length === 0) return false;
  return holiday.counties.includes(province);
}

export async function fetchCanadaHolidaysFromNager(year: number): Promise<Holiday[] | null> {
  const endpoint = `https://date.nager.at/api/v3/PublicHolidays/${year}/CA`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      // Holidays update infrequently; one-day revalidation is enough.
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as NagerHoliday[];
    return data.map(mapNagerHoliday).sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch {
    return null;
  }
}

async function getHolidaysForYear(year: number): Promise<Holiday[]> {
  const fromApi = await fetchCanadaHolidaysFromNager(year);
  if (fromApi && fromApi.length > 0) return fromApi;
  return getFederalHolidays(year);
}

export async function getHolidaysForIsoWeek(
  year: number,
  weekNumber: number,
  province: ProvinceCode | null = null,
): Promise<Holiday[]> {
  const [previousYear, currentYear, nextYear] = await Promise.all([
    getHolidaysForYear(year - 1),
    getHolidaysForYear(year),
    getHolidaysForYear(year + 1),
  ]);
  const all = [...previousYear, ...currentYear, ...nextYear];
  return all.filter(
    (holiday) =>
      getIsoWeekYear(holiday.date) === year &&
      getIsoWeekNumber(holiday.date) === weekNumber &&
      matchesProvince(holiday, province),
  );
}

export async function getHolidaysForDateRange(
  start: Date,
  end: Date,
  province: ProvinceCode | null = null,
): Promise<Holiday[]> {
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const years = Array.from(new Set([startYear - 1, startYear, endYear, endYear + 1]));
  const holidayGroups = await Promise.all(years.map((year) => getHolidaysForYear(year)));
  const all = holidayGroups.flat();
  const startTime = start.getTime();
  const endTime = end.getTime();

  return all.filter((holiday) => {
    const holidayTime = holiday.date.getTime();
    return holidayTime >= startTime && holidayTime <= endTime && matchesProvince(holiday, province);
  });
}

export async function getNextLongWeekend(
  year: number,
  now = new Date(),
  province: ProvinceCode | null = null,
): Promise<LongWeekend | null> {
  const holidays = await getHolidaysForYear(year);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));

  for (const holiday of holidays) {
    if (!matchesProvince(holiday, province)) continue;
    const day = holiday.date.getUTCDay();
    const start = new Date(holiday.date);
    const end = new Date(holiday.date);

    if (day === 1) {
      start.setUTCDate(start.getUTCDate() - 2);
    } else if (day === 5) {
      end.setUTCDate(end.getUTCDate() + 2);
    } else {
      continue;
    }

    if (end >= today) {
      return {
        labelEn: `${holiday.nameEn} weekend`,
        labelFr: `Long week-end - ${holiday.nameFr}`,
        start,
        end,
      };
    }
  }

  return null;
}
