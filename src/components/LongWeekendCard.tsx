import { type LongWeekend } from "@/lib/holidays-ca";
import { type Dictionary, type Locale, toLocaleCode } from "@/lib/i18n";

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  longWeekend: LongWeekend | null;
};

export function LongWeekendCard({ locale, dictionary, longWeekend }: Props) {
  if (!longWeekend) {
    return (
      <section className="panel">
        <h3>{dictionary.nextLongWeekend}</h3>
        <p>{dictionary.noLongWeekend}</p>
      </section>
    );
  }

  const localeCode = toLocaleCode(locale);
  const start = new Intl.DateTimeFormat(localeCode, { dateStyle: "full", timeZone: "UTC" }).format(
    longWeekend.start,
  );
  const end = new Intl.DateTimeFormat(localeCode, { dateStyle: "full", timeZone: "UTC" }).format(longWeekend.end);

  return (
    <section className="panel">
      <h3>{dictionary.nextLongWeekend}</h3>
      <p className="longWeekendName">{locale === "fr" ? longWeekend.labelFr : longWeekend.labelEn}</p>
      <p>
        {start} - {end}
      </p>
    </section>
  );
}
