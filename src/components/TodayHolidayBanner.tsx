import Link from "next/link";
import type { Holiday } from "@/lib/holidays-ca";
import type { Locale } from "@/lib/i18n";
import type { ProvinceCode } from "@/lib/provinces";

type Props = {
  locale: Locale;
  holiday: Holiday;
  province: ProvinceCode | null;
  year: number;
};

export function TodayHolidayBanner({ locale, holiday, province, year }: Props) {
  const isFr = locale === "fr";
  const name = isFr ? holiday.nameFr : holiday.nameEn;
  const provinceSlug = province ? province.replace("CA-", "").toLowerCase() : "ca";
  const href = `/${locale}/statutory-holidays/${provinceSlug}/${year}`;
  const scopeLabel = holiday.global
    ? isFr
      ? "Férié national"
      : "National holiday"
    : isFr
      ? "Férié provincial"
      : "Provincial holiday";

  return (
    <aside className="todayHolidayBanner" role="note" aria-label={isFr ? "Jour férié aujourd'hui" : "Holiday today"}>
      <div className="todayHolidayBannerInner">
        <span className="todayHolidayBannerBadge" aria-hidden="true">
          {isFr ? "Aujourd'hui" : "Today"}
        </span>
        <p className="todayHolidayBannerText">
          {isFr ? "C'est " : "It's "}
          <strong>{name}</strong>
          {" — "}
          <span className="subtle">{scopeLabel}</span>
        </p>
        <Link href={href} prefetch={false} className="todayHolidayBannerLink">
          {isFr ? "Voir tous les fériés →" : "See all holidays →"}
        </Link>
      </div>
    </aside>
  );
}
