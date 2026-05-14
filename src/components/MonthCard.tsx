import Link from "next/link";
import { type Dictionary, type Locale, toLocaleCode } from "@/lib/i18n";
import { getIsoWeekNumber, getIsoWeekYear, type MonthCalendar, type WeekSystem } from "@/lib/week";

type MonthCardProps = {
  dictionary: Dictionary;
  locale: Locale;
  month: MonthCalendar;
  todayStr: string;
  year: number;
  system: WeekSystem;
  daysShort: string[];
};

export function MonthCard({
  dictionary,
  locale,
  month,
  todayStr,
  year,
  system: _system,
  daysShort,
}: MonthCardProps) {
  const localeCode = toLocaleCode(locale);

  const headingId = `month-${month.monthIndex}-title`;

  return (
    <article className="monthCard">
      <h2 id={headingId}>{dictionary.monthsLong[month.monthIndex]}</h2>
      <table aria-labelledby={headingId}>
        <thead>
          <tr>
            <th scope="col">{dictionary.weekAbbrev}</th>
            {daysShort.map((day) => (
              <th key={day} scope="col">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week) => {
            const anchor = week.days[0]?.date;
            const isoLinkYear = anchor ? getIsoWeekYear(anchor) : year;
            const isoLinkWeek = anchor ? getIsoWeekNumber(anchor) : week.weekNumber;
            const weekDetailHref = `/${locale}/week/${isoLinkYear}/${isoLinkWeek}`;

            return (
              <tr key={`${month.monthIndex}-${week.weekNumber}-${anchor?.toISOString() ?? ""}`} className={week.isCurrentWeek ? "currentRow" : ""}>
                <th className="weekNum" scope="row">
                  <Link href={weekDetailHref} prefetch={false}>
                    {String(week.weekNumber).padStart(2, "0")}
                  </Link>
                </th>
              {week.days.map((day) => {
                const isToday = day.date.toISOString() === todayStr;
                const title = new Intl.DateTimeFormat(localeCode, {
                  dateStyle: "full",
                  timeZone: "UTC",
                }).format(day.date);
                return (
                  <td
                    key={day.date.toISOString()}
                    title={title}
                    className={`${day.inMonth ? "inMonth" : "outMonth"}${isToday ? " isToday" : ""}`}
                  >
                    {day.dayOfMonth}
                  </td>
                );
              })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}
