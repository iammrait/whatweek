import { type Dictionary, type Locale } from "@/lib/i18n";
import { type MonthCalendar, type WeekSystem } from "@/lib/week";
import { MonthCard } from "./MonthCard";

type Props = {
  dictionary: Dictionary;
  locale: Locale;
  months: MonthCalendar[];
  year: number;
  system: WeekSystem;
  today: Date;
};

export function YearCalendar({ dictionary, locale, months, year, system, today }: Props) {
  const todayStr = today.toISOString();
  const daysShort = system === "canada" ? dictionary.daysShortSundayFirst : dictionary.daysShort;

  return (
    <section className="monthOverview">
      {months.map((month) => (
        <MonthCard
          key={month.monthIndex}
          dictionary={dictionary}
          locale={locale}
          month={month}
          todayStr={todayStr}
          year={year}
          system={system}
          daysShort={daysShort}
        />
      ))}
    </section>
  );
}
