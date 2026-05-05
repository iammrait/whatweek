export type CalendarDay = {
  date: Date;
  dayOfMonth: number;
  inMonth: boolean;
  weekNumber: number;
};

export type CalendarWeek = {
  weekNumber: number;
  days: CalendarDay[];
  isCurrentWeek: boolean;
};

export type MonthCalendar = {
  monthIndex: number;
  weeks: CalendarWeek[];
};

export type WeekSystem = "iso" | "canada";

function toUtcMidday(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0),
  );
}

export function startOfIsoWeek(input: Date): Date {
  const date = toUtcMidday(input);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date;
}

export function getIsoWeekYear(dateInput: Date): number {
  const date = startOfIsoWeek(dateInput);
  date.setUTCDate(date.getUTCDate() + 3);
  return date.getUTCFullYear();
}

export function getIsoWeekNumber(input: Date): number {
  const date = startOfIsoWeek(input);
  date.setUTCDate(date.getUTCDate() + 3);
  const isoYear = date.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4, 12, 0, 0));
  const firstWeekStart = startOfIsoWeek(firstThursday);
  const diffMs = date.getTime() - firstWeekStart.getTime();
  return 1 + Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function getWeeksInIsoYear(year: number): number {
  return getIsoWeekNumber(new Date(Date.UTC(year, 11, 28, 12, 0, 0)));
}

export function startOfCanadaWeek(input: Date): Date {
  const date = toUtcMidday(input);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - day);
  return date;
}

export function getCanadaWeekYear(input: Date): number {
  const weekStart = startOfCanadaWeek(input);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  if (weekStart.getUTCFullYear() !== weekEnd.getUTCFullYear() && weekEnd.getUTCMonth() === 0) {
    return weekEnd.getUTCFullYear();
  }

  return toUtcMidday(input).getUTCFullYear();
}

export function getCanadaWeekNumber(input: Date): number {
  const weekYear = getCanadaWeekYear(input);
  const jan1 = new Date(Date.UTC(weekYear, 0, 1, 12, 0, 0));
  const weekStart = startOfCanadaWeek(input);
  const firstWeekStart = startOfCanadaWeek(jan1);
  const diffMs = weekStart.getTime() - firstWeekStart.getTime();
  return 1 + Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function getWeeksInCanadaYear(year: number): number {
  const currentYearStart = startOfCanadaWeek(new Date(Date.UTC(year, 0, 1, 12, 0, 0)));
  const nextYearStart = startOfCanadaWeek(new Date(Date.UTC(year + 1, 0, 1, 12, 0, 0)));
  return Math.round((nextYearStart.getTime() - currentYearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

export function getWeekSystem(input: string | undefined): WeekSystem {
  return input === "iso" ? "iso" : "canada";
}

export function startOfWeek(input: Date, system: WeekSystem): Date {
  return system === "canada" ? startOfCanadaWeek(input) : startOfIsoWeek(input);
}

export function getWeekNumber(input: Date, system: WeekSystem): number {
  return system === "canada" ? getCanadaWeekNumber(input) : getIsoWeekNumber(input);
}

export function getWeekYear(input: Date, system: WeekSystem): number {
  return system === "canada" ? getCanadaWeekYear(input) : getIsoWeekYear(input);
}

export function getWeeksInYear(year: number, system: WeekSystem): number {
  return system === "canada" ? getWeeksInCanadaYear(year) : getWeeksInIsoYear(year);
}

export function getTodayInTimeZone(timeZone: string, now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12, 0, 0));
}

export function getYearCalendar(year: number, now = new Date(), system: WeekSystem = "iso"): MonthCalendar[] {
  const startForSystem = (date: Date) => startOfWeek(date, system);
  const weekNumberForSystem = (date: Date) => getWeekNumber(date, system);
  const currentWeekStart = startForSystem(now).getTime();

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
    const lastOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 12, 0, 0));
    const start = startForSystem(firstOfMonth);
    const end = startForSystem(lastOfMonth);
    end.setUTCDate(end.getUTCDate() + 6);

    const weeks: CalendarWeek[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const weekStart = new Date(cursor);
      const weekNumber = weekNumberForSystem(weekStart);
      const days: CalendarDay[] = Array.from({ length: 7 }, (_, offset) => {
        const day = new Date(weekStart);
        day.setUTCDate(weekStart.getUTCDate() + offset);
        return {
          date: day,
          dayOfMonth: day.getUTCDate(),
          inMonth: day.getUTCMonth() === monthIndex,
          weekNumber: weekNumberForSystem(day),
        };
      });

      weeks.push({
        weekNumber,
        days,
        isCurrentWeek: weekStart.getTime() === currentWeekStart,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }

    return { monthIndex, weeks };
  });
}

export function formatDateLong(date: Date, locale: string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone,
  }).format(date);
}
