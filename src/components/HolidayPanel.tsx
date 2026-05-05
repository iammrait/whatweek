import { type Locale, toLocaleCode, type Dictionary } from "@/lib/i18n";
import { type Holiday } from "@/lib/holidays-ca";

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  holidays: Holiday[];
};

export function HolidayPanel({ locale, dictionary, holidays }: Props) {
  const localeCode = toLocaleCode(locale);

  return (
    <section className="panel">
      <h3>{dictionary.holidaysThisWeek}</h3>
      {holidays.length === 0 ? (
        <p>{dictionary.noHolidaysThisWeek}</p>
      ) : (
        <ul>
          {holidays.map((holiday) => (
            <li key={`${holiday.nameEn}-${holiday.date.toISOString()}`}>
              <strong>{locale === "fr" ? holiday.nameFr : holiday.nameEn}</strong>{" "}
              <span>
                {new Intl.DateTimeFormat(localeCode, { dateStyle: "full", timeZone: "UTC" }).format(holiday.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="subtle">{dictionary.holidayNote}</p>
    </section>
  );
}
