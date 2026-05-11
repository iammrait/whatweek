import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { TimezoneClock } from "@/components/TimezoneClock";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildLocaleAlternates,
} from "@/lib/seo-metadata";
import {
  canadianTimezoneSlugs,
  canadianTimezones,
  getTimezoneName,
  getTimezoneRegions,
  isCanadianTimezoneSlug,
  type CanadianTimezoneSlug,
} from "@/lib/timezones-ca";
import {
  getCanadaWeekNumber,
  getIsoWeekNumber,
  getIsoWeekYear,
  getTodayInTimeZone,
  startOfIsoWeek,
} from "@/lib/week";
import { formatLong } from "@/lib/date-math";


type Props = {
  params: Promise<{ locale: string; tz: string }>;
};

export function generateStaticParams() {
  const params: Array<{ locale: string; tz: CanadianTimezoneSlug }> = [];
  for (const locale of locales) {
    for (const slug of canadianTimezoneSlugs) {
      params.push({ locale, tz: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tz } = await params;
  if (!isLocale(locale) || !isCanadianTimezoneSlug(tz)) return {};
  const data = canadianTimezones[tz];
  const isFr = locale === "fr";
  const name = getTimezoneName(data, locale);
  const title = isFr
    ? `${name} — heure et numéro de semaine actuels au Canada`
    : `${name} — current time & week number in Canada`;
  const description = isFr
    ? `Heure en direct, semaine ISO 8601 et semaine canadienne (dim–sam) pour le fuseau ${name}. Couverture par province et abréviations (${data.abbreviationStandard} / ${data.abbreviationDaylight}).`
    : `Live time, ISO 8601 week, and Canadian Sun–Sat week for the ${name} time zone. Province coverage and abbreviations (${data.abbreviationStandard} / ${data.abbreviationDaylight}).`;
  const ogImage = `https://whatweek.ca/${locale}/opengraph-image`;
  return {
    title,
    description,
    alternates: buildLocaleAlternates(`/timezones/${tz}`),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://whatweek.ca/${locale}/timezones/${tz}`,
      locale: isFr ? "fr_CA" : "en_CA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

function getTzOffsetMinutes(timeZone: string, now: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const parts = dtf.formatToParts(now);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tz);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

export default async function TimezonePage({ params }: Props) {
  const { locale: localeInput, tz: tzInput } = await params;
  if (!isLocale(localeInput) || !isCanadianTimezoneSlug(tzInput)) notFound();
  const locale: Locale = localeInput;
  const tz = tzInput;
  const data = canadianTimezones[tz];
  const isFr = locale === "fr";

  const now = new Date();
  const today = getTodayInTimeZone(data.ianaTimeZone, now);
  const isoWeek = getIsoWeekNumber(today);
  const isoYear = getIsoWeekYear(today);
  const canadaWeek = getCanadaWeekNumber(today);
  const start = startOfIsoWeek(today);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const offsetMinutes = getTzOffsetMinutes(data.ianaTimeZone, now);

  const name = getTimezoneName(data, locale);
  const regions = getTimezoneRegions(data, locale);

  const otherZones = canadianTimezoneSlugs.filter((slug) => slug !== tz);

  const faq = [
    {
      question: isFr ? `Quelle heure est-il en ${name} ?` : `What time is it in ${name}?`,
      answer: isFr
        ? `L'heure ci-dessus se met à jour en direct depuis votre navigateur. Elle utilise le fuseau IANA ${data.ianaTimeZone}, qui passe automatiquement entre ${data.abbreviationStandard} (${data.utcOffsetStandard}) et ${data.abbreviationDaylight} (${data.utcOffsetDaylight}).`
        : `The time above updates live from your browser. It uses the IANA zone ${data.ianaTimeZone}, which automatically switches between ${data.abbreviationStandard} (${data.utcOffsetStandard}) and ${data.abbreviationDaylight} (${data.utcOffsetDaylight}).`,
    },
    {
      question: isFr
        ? `Quel numéro de semaine est-ce en ${name} ?`
        : `What week number is it in ${name}?`,
      answer: isFr
        ? `Aujourd'hui correspond à la semaine ISO ${isoWeek} de ${isoYear} et à la semaine canadienne ${canadaWeek} (dimanche–samedi).`
        : `Today is ISO week ${isoWeek} of ${isoYear} and Canadian week ${canadaWeek} (Sunday–Saturday).`,
    },
    {
      question: isFr
        ? `Quelles provinces utilisent ${name} ?`
        : `Which provinces use ${name}?`,
      answer: regions.join(" · "),
    },
    {
      question: isFr ? "Y a-t-il l'heure d'été ?" : "Is there daylight saving time?",
      answer: isFr
        ? "Oui pour la plupart du Canada — début le 2e dimanche de mars, fin le 1er dimanche de novembre. Exceptions : la majorité de la Saskatchewan, le Yukon et certaines régions du Nunavut et de la Colombie-Britannique restent à l'heure normale toute l'année."
        : "Yes for most of Canada — begins on the second Sunday of March and ends on the first Sunday of November. Exceptions: most of Saskatchewan, Yukon, and parts of Nunavut and British Columbia stay on standard time year-round.",
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(locale, [
    { name: isFr ? "Fuseaux horaires" : "Time zones", path: "/timezones" },
    { name: getTimezoneName(data, locale), path: `/timezones/${tz}` },
  ]);
  const graphJsonLd = { "@context": "https://schema.org", "@graph": [breadcrumbJsonLd, faqJsonLd] };
  const renderJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <main className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(graphJsonLd) }} />
      <SiteHeader locale={locale} />

      <section className="hero">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/${locale}`} prefetch={false}>{isFr ? "Accueil" : "Home"}</Link>
          <span> / </span>
          <Link href={`/${locale}/timezones`} prefetch={false}>{isFr ? "Fuseaux horaires" : "Time zones"}</Link>
          <span> / </span>
          <span>{name}</span>
        </nav>
        <h1>{name}</h1>
        <p className="subtle heroLead">
          {isFr
            ? `Heure en direct, numéros de semaine et couverture provinciale pour ${name} au Canada.`
            : `Live time, week numbers, and provincial coverage for ${name} in Canada.`}
        </p>
      </section>

      <section className="panel">
        <TimezoneClock
          locale={locale}
          ianaTimeZone={data.ianaTimeZone}
          initialTimeIso={now.toISOString()}
          initialOffsetMinutes={offsetMinutes}
        />
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Cette semaine" : "This week"}</h2>
        <ul>
          <li>
            <strong>{isFr ? "Semaine ISO" : "ISO week"}:</strong> {isoWeek} · {isoYear} ·{" "}
            <Link href={`/${locale}/week/${isoYear}/${isoWeek}`} prefetch={false}>
              {isFr ? "voir la semaine →" : "view the week →"}
            </Link>
          </li>
          <li>
            <strong>{isFr ? "Semaine canadienne (dim–sam)" : "Canadian week (Sun–Sat)"}:</strong> {canadaWeek}
          </li>
          <li>
            <strong>{isFr ? "Du" : "From"}</strong> {formatLong(start, locale)} <strong>{isFr ? "au" : "to"}</strong>{" "}
            {formatLong(end, locale)}
          </li>
        </ul>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "À propos de ce fuseau" : "About this time zone"}</h2>
        <ul>
          <li>
            <strong>{isFr ? "Identifiant IANA" : "IANA ID"}:</strong> <code>{data.ianaTimeZone}</code>
          </li>
          <li>
            <strong>{isFr ? "Heure normale" : "Standard time"}:</strong> {data.abbreviationStandard} ({data.utcOffsetStandard})
          </li>
          <li>
            <strong>{isFr ? "Heure avancée" : "Daylight time"}:</strong> {data.abbreviationDaylight} ({data.utcOffsetDaylight})
          </li>
          <li>
            <strong>{isFr ? "Régions" : "Regions"}:</strong> {regions.join(" · ")}
          </li>
        </ul>
      </section>

      <section className="panel quickLinks">
        <h2>{isFr ? "Autres fuseaux canadiens" : "Other Canadian time zones"}</h2>
        <div className="linkGrid">
          {otherZones.map((slug) => (
            <Link key={slug} href={`/${locale}/timezones/${slug}`} prefetch={false}>
              {getTimezoneName(canadianTimezones[slug], locale)}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel contentSection">
        <h2>{isFr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
        {faq.map((entry) => (
          <article key={entry.question} className="faqEntry">
            <h3>{entry.question}</h3>
            <p>{entry.answer}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
