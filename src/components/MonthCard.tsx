import Link from "next/link";
import { type Dictionary, type Locale, toLocaleCode } from "@/lib/i18n";
import { type MonthCalendar, type WeekSystem } from "@/lib/week";

type MonthCardProps = {
  dictionary: Dictionary;
  locale: Locale;
  month: MonthCalendar;
  todayStr: string;
  year: number;
  system: WeekSystem;
  daysShort: string[];
};

export function MonthCard({ dictionary, locale, month, todayStr, year, system, daysShort }: MonthCardProps) {
  const localeCode = toLocaleCode(locale);
  const caption = `${dictionary.monthsLong[month.monthIndex]} ${year}`;

  return (
    <article className="monthCard">
      <h2>{dictionary.monthsLong[month.monthIndex]}</h2>
      <table>
        <caption className="srOnly">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{dictionary.weekAbbrev}</th>
            {daysShort.map((day) => (
              <th key={day} scope="col">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {month.weeks.map((week) => (
            <tr key={`${month.monthIndex}-${week.weekNumber}`} className={week.isCurrentWeek ? "currentRow" : ""}>
              <th className="weekNum" scope="row">
                {system === "iso" ? (
                  <Link href={`/${locale}/week/${year}/${week.weekNumber}`} prefetch={false}>
                    {String(week.weekNumber).padStart(2, "0")}
                  </Link>
                ) : (
                  String(week.weekNumber).padStart(2, "0")
                )}
              </th>
              {week.days.map((day) => {
                const isToday = day.date.toISOString() === todayStr;
                return (
                  <td key={day.date.toISOString()} className={`${day.inMonth ? "inMonth" : "outMonth"} ${isToday ? "isToday" : ""}`}>
                    <span
                      title={new Intl.DateTimeFormat(localeCode, {
                        dateStyle: "full",
                        timeZone: "UTC",
                      }).format(day.date)}
                      className={isToday ? "todayBadge" : ""}
                    >
                      {day.dayOfMonth}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
